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
  # getTrail( "http://www.site.com/path/to/my/file.txt" ) ->
  #  ["/", "/path/to/", "/path/to/my/", "/path/to/my/file.txt"]
  #
  # getTrail( "http://www.site.com/path/to/my/#fragment" ) ->
  #  ["/", "/path/to/", "/path/to/my/", "/path/to/my/"]
  #
  # if the last element of the returned array does not end with a '/', then
  # this path does not refer to a file.
  #
  # @param url an absolute URL
  #
  # @return {Array} An array of paths, starting with the most interior
  # path.
  getTrail = ( url ) ->
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
  # @param fileName the String name of the file
  #
  # @return {String} the suffix, or null if there is none.
  getSuffix = ( fileName ) ->
    split = fileName.split '.'

    if split.length > 1
      split[ split.length - 1 ]
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

      # the root
      @rootPath = rootPath

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

    absPath = (path) =>


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
    # Will get the current state using History.getState() if not defined.
    #
    # @return this
    updateView = (state) =>

      showLoading()

      History.replaceState(state)

      # if we've visited the state before and grabbed data, reuse that object
      if state.url in cachedStates
        state = cachedStates[ state.url ]

      # store new state in cache if it has pseudositer data.
      else
        if state.data.pseudositer?
          cachedStates[ state.url ] = state

      # if we already have content data for state, use it
      if state.data.pseudositer?
        showLinks getPathArray state.url

        showContent state.data.pseudositer.$content

        hideLoading()

      else # load the data for the state
        # call back updateView after the state is loaded
        createStateObjectWithData state.title, state.url, updateView

      this

    # Asynchronously create a new state object with freshly loaded data.
    #
    # This load new view data from the provided url.  If the state is an index,
    # make ajax requests to unfold it to the deepest directory and the
    # first object in that directory.
    #
    # @param deferred
    # @param title the title of the new state object
    # @param url the url of the new state object
    #
    # @return this
    createStateObjectWithData = (deferred, title, url) =>

      data = {}

      componentPaths = componentPaths sansData.url



      withData = History.createStateObject data sansData.title sansData.url

      this

    # Load a new set of links into @pathLinks.
    #
    # @param deferred the deferred to append this asynchronous operation to.
    # @param path the path to the links to load.
    #
    # @return this
    loadLinks = (deferred, path) =>

      deferred.then =>
        ajaxGet path, (data, textStatus, jqXHR) =>
          @pathLinks[ path ] = $(data).find(options.linkSelector)

      this

    # Load generic content from a path into an object.
    #
    # @param deferred the deferred to append this asynchronous operation to.
    # @param path the path to the links to the content to load.
    # @param object
    #
    # @return this
    loadContent = (deferred, path, object) =>

      deferred.then =>
        switch getSuffix path
          when 'jpg' then
            loadImage deferred, path, object
          when 'gif' then
            loadImage deferred, path, object
          when 'png' then
            loadImage deferred, path, object
          when 'txt' then
            loadText deferred, path, object
          when 'html' then
            loadText deferred, path, object
          else
            loadText deferred, path, object

      this

    loadImage = (path, object) =>
      object.content = $( 'img' ).attr 'src', absPath(path)

    loadText = (deferred, path, object) =>

    # Show the links for a path, in addition to the links for all its
    # parents.  This data should already have been loaded into
    # @pathLinks .
    #
    # @param path the path
    #
    # @return this
    showLinks = (path) =>

      trail = getTrail(path)

      for pathNum in [0...trail.length]
        path = trail[pathNum]
        $links = @pathLinks[path]

      this

    # Remove existing content and show new content.
    #
    # @param $content the DOM content to display.
    #
    # @return this
    showContent = ($content) =>
      $(@options.contentClass)
        .empty ()
        .append( $content );
      this


    # call init, and return the output
    @init()

  # object literal containing default options
  $.pseudositer.defaultOptions =
    loadingClass: 'pseudositer-load'
    contentClass: 'pseudositer-content'
    directoryClass: 'pseudositer-directory'
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
