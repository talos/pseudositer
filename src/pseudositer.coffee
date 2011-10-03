###
# Pseudositer 0.0.4 content management for the lazy
#
# kudos to coffee-plate https://github.com/pthrasher/coffee-plate
###

(($) ->

  ###
  # Utility functions
  ###

  # Obtain the path component of an absolute URL.  For example:
  #
  # getPathArray( "http://www.site.com/path/to/my/file.txt" ) ->
  #  [ "path", "to", "my", "file.txt" ]
  #
  # @param url an absolute URL
  #
  # @return {Array} the path component of the absolute URL, split
  # by '/'
  getPathArray = ( url ) ->
    split = url
      .split( '#' )[0]
      .split( '/' )
    split[ 3...split.length ]

  # Obtain the paths leading up to and including the path of the provided
  # url.  For example:
  #
  # getTrails( "http://www.site.com/path/to/my/file.txt" ) ->
  #  ["/", "/path/to/", "/path/to/my/", "/path/to/my/file.txt"]
  #
  # getTrails( "http://www.site.com/path/to/my/#fragment" ) ->
  #  ["/", "/path/to/", "/path/to/my/", "/path/to/my/"]
  #
  # if the last element of the returned array does not end with a '/', then
  # this path does not refer to a file.
  #
  # @param url an absolute URL
  #
  # @return {Array} An array of paths, starting with the most interior
  # path.
  getTrails = ( url ) ->
    ary = getPathArray url

    # the first path is always a '/'
    trail = ['/']

    # for each element after that before the last, append it to the trail with a trailing
    # '/'
    trail.push( '/' + ary[ 0..i ].join( '/' ) + '/' ) for i in [ 1...ary.length - 1 ]

    # if the path leads to a file, append it without a trailing slash.
    if ary[ ary.length - 1 ] isnt ''
      trail.push '/' + ary.join '/'

    trail

  # Obtain the file type suffix (after a period)
  #
  # @param path the path to the file
  #
  # @return {String} the suffix, or null if there is none.
  getSuffix = ( path ) ->
    splitBySlash = path.split '/'
    fileName = splitBySlash[ splitBySlash.length - 1 ]

    splitByDot = fileName.split('.')

    if splitByDot.length > 1
      splitByDot[ splitByDot.length - 1 ]
    else
      null

  ###
  # Plugin code
  ###
  $.pseudositer = (el, options) ->

    # Access to jQuery and DOM versions of element
    @el = el
    @$el = $ el

    # Add a reverse reference to the DOM object
    @$el.data "pseudositer", @

    # Cache of links by path.  Each value is an array of <a> links.
    @pathLinks = {}

    # Cache of states by URL.  Each value is the State.
    @cachedStates = {}

    # Initialization code
    @init = (rootPath) =>
      @options = $.extend {}, $.pseudositer.defaultOptions, options

      # Assign the root, ensure that it ends in '/'
      @rootPath = if rootPath.charAt( rootPath.length - 1 ) is '/' then rootPath else "#{rootPath}/"

      # Create loading div if one doesn't already exist,
      # and keep reference to the div.
      if $(@options.loadingClass).length is 0
        @$loading = $('<div>').addClass @options.loadingClass
        @$el.append( @$loading )
      else
        @$loading = $ @options.loadingClass

      # Initially loading div is hidden
      @$loading.hide()

      # Create content div if one doesn't already exist,
      # and keep reference to the div.
      if $(@options.contentClass).length is 0
        @$content = $('<div>').addClass @options.contentClass
        @$el.append @$content
      else
        @$content = $ @options.contentClass

      # Bind state change to private methods.
      History.Adapter.bind window, 'statechange', () =>
        updateView History.getState()

      # Immediately update view
      updateView History.getState()

      # return this
      this

    ###
    # Public methods
    ###

    # Destroy pseudositer & remove all its content.
    #
    # @return this
    @destroy = =>

      # Empty out the original element.
      @$el.empty()

      # TODO Clear all event bindings.

      this

    ###
    # Private methods.
    ###

    # Get the class name for links of a specified level.
    #
    # @param level the {int} level, starting with 0, of the links.
    #
    # @return {String} the name of the class
    getLinkClassForLevel = ( level ) =>

      @options.linkClass + '-' + level

    # Get the class name for links with a certain path.
    #
    # @param path the {String} path to the links.
    #
    # @return {String} the name of the class
    # getLinkClassForPath = ( path ) =>

    #   # generate a safe version of the path to use as the class name
    #   name = path.replace /[^a-zA-Z0-9]/g, '-'
    #   @options.linkClass + '-' + name

    # Calculate the actual path for an ajax request from a path from
    # the address bar.  Resolves the path against @rootPath.
    #
    # @param path a path from the address bar
    #
    # @return {String} a path that can be used for an ajax request.
    resolve = (path) =>

      # @rootPath always ends in '/'
      if path.charAt 0 is '/' then @rootPath + path.substr 1 else @rootPath + path

    # Show the loading notice
    #
    # @return this
    showLoading = =>

      @$loading.show()
      this

    # Hide the loading notice
    #
    # @return this
    hideLoading = =>

      @$loading.hide()
      this

    # Load a URL using AJAX
    #
    # @param url the URL to load
    # @param callback a callback function that will be passed a jqXHR
    # object.
    # loader = $.Deferred() url, callback) ->
    #   $.get url, (data, textStatus, jqXHR) ->
    #     callback(jqXHR)

    #   undefined

    # Update browser to display the view associated with a state.
    # Will check the cache to see if this state has been loaded before.
    #
    # @param state the State object to use when updating the view.
    #
    # @return this
    updateView = ( state ) =>

      History.replaceState( state )

      # if we've visited the state before and grabbed data, reuse that object
      if state.url in cachedStates
        state = cachedStates[ state.url ]

      # store state in cache if it has pseudositer data.
      else
        if state.data.pseudositer?
          cachedStates[ state.url ] = state

      # if we already have content data for state, use it
      if state.data.pseudositer?
        showLinks state.url

        showContent state.data.pseudositer.$content

      else # load the data for the state
        showLoading()

        # call back updateView after the state is loaded
        $.when( load( state ) )
          .done   => updateView state
          .fail   => console.log state # TODO actual logging
          .always => hideLoading()

      this

    # Obtain a {Promise} object that, once done, has loaded and cached
    # (into @pathLinks) all the paths leading to the supplied state's content,
    # and also loads the content into that state.
    #
    # @param state the {State} to load
    #
    # @return {Promise} object that, when finished, means that
    # data has been loaded into cache and state.  Callbacks receive
    # the new {State} as an argument.
    load = ( state ) =>

      Deferred dfd = new $.Deferred()
      url = state.url

      trails = getTrails url

      # pipe an additional request for any trails that are not in the cache
      for level in [ 0...trails.length ]

        trail = trails[ i ]
        unless trail in @pathLinks
          dfd = dfd.pipe loadIndex trail

      path = trails[ trails.length - 1 ]

      # unfold the path to content.  once the path is unfolded,
      # load the content.  once the content is loaded, resolve
      # the deferred with a new state based off of the content
      # and unfolded path.
      $.when( unfold( path ) ).done (unfoldedPath) =>
        loadContent( unfoldedPath ).done ($content) =>
          state = History.createStateObject
            pseudositer :
              $content  : $content,
            null,
            unfoldedPath
          dfd.resolve state

      dfd.promise()


    # Asynchronously determine the nearest content to this path,
    # loading links into cache all along the way.
    #
    # @param path the path to unfold
    # @param dfd An optional {Deferred} to resolve once the unfolding
    # is done
    #
    # @return {Promise} that will be resolved with an argument
    # that is the unfolded path
    unfold = ( path, dfd = $.Deferred ) =>

      # if path already points to content, resolve now
      if getSuffix path isnt null
        dfd.resolve( path )
      else

        # when the index is loaded, call unfold again but reusing
        # the deferred object
        $.when( loadIndex ).done ( $links ) =>
          unfold( $links.first().attr 'href', dfd )

      dfd.promise()

    # If there is no entry for the index,
    # make an ajax request for a path to the index page, and cache
    # all the links on that index page into @pathLinks.
    #
    # @param path the path to an index page
    #
    # @return {Promise} which will resolve with an
    # argument that is an array of all the links in that index
    loadIndex = ( path ) =>
      dfd = new $.Deferred()
      if @pathLinks[ path ]?
        dfd.resolve @pathLinks[ path ]
      else
        $.when $.get resolve path, data =>
          @pathLinks[ path ] = $( data ).find options.linkSelector
          dfd.resolve( @pathLinks [ path ] )
      dfd

    # Load the content located at a path
    #
    # @param pathToContent the path to the content
    #
    # @return {Promise} that, when done, contains the loaded content.
    loadContent = ( pathToContent ) =>
      dfd = new $.Deferred()

      suffix = getSuffix pathToContent
      switch suffix
        when 'png' then

      dfd.promise()

    loadImage = ( pathToImage ) =>
      object.content = $( 'img' ).attr 'src', resolvedPath

    loadText = ( pathToText ) =>

    # Show the links for an unfolded url, in addition to the links
    # for all its
    # parents.  This data should already have been loaded into
    # @pathLinks .
    #
    # @param url the URL to show links for
    #
    # @return this
    showLinks = ( url ) =>

      trails = getTrails url

      # mark all link elements as stale before we iterate through the
      # path
      $( '.' + @options.linkClass ).addClass @options.staleClass

      for level in [ 0...trails.length ]

        trail = trails[ level ]

        # If a class for the level is not on the page, create it
        levelClass = getLinkClassForLevel level
        $linkElem = $( '.' + levelClass )
        if $linkElem.length is 0
          $linkElem = $( 'div' )
            .addClass @options.linkClass + ' ' + levelClass
            .data 'pseudositer', { }
          @$el.append $linkElem

        # If the previous path is the same, leave the element alone
        # otherwise, change the path and append the links
        prevPath = $linkElem.data('pseudositer').path
        unless trail is prevPath
          $linkElem.empty ()
          $linkElem.data( 'pseudositer', path : trail )
          $linkElem.append @pathLinks[ trail ]

        # ensure that this link element is not removed.
        $linkElem.removeClass @options.staleClass

      # remove any link elements that are deeper than the new path
      $( '.' + @options.linkClass + '.' + @options.staleClass ).remove()

      this

    # Remove existing content and show new content.
    #
    # @param $content the DOM content to display.
    #
    # @return this
    showContent = ( $content ) =>
      $( @$content ).empty ()
        .append( $content );
      this

    # call init, and return the output
    @init()

  # object literal containing default options
  $.pseudositer.defaultOptions =
    loadingClass   : 'pseudositer-load'
    contentClass   : 'pseudositer-content'
    staleClass     : 'pseudositer-stale'
    linkClass      : 'pseudositer-links'
  	linkSelector   : 'a:not([href^="?"],[href^="/"])', # Find links from a directory listing that go deeper


  $.fn.pseudositer = (options) ->
    $.each @, (i, el) ->
      $el = ($ el)

      # Only instantiate if not previously done.
      unless $el.data 'pseudositer'
        # call plugin on el with options, and set it to the data.
        # the instance can always be retrieved as element.data 'pseudositer'
        # You can do things like:
        # (element.data 'pseudositer').publicMethod1();
        $el.data 'pseudositer', new $.pseudositer el, options
  undefined
)(jQuery)
