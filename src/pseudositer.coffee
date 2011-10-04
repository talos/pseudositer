###
Pseudositer 0.0.4 content management for the lazy

kudos to coffee-plate https://github.com/pthrasher/coffee-plate

To use pseudositer, call the plugin upon an HTML element with an argument for
the path to your content.

Read the documentation at http://www.github.com/talos/pseudositer for other
options.

You can use the following boilerplate to get pseudositer running.
Substitute the path to your content in place of "path/to/content/index/",
and the paths to your javascript libraries as appropriate:

<html>
  <head>

    <!-- jQuery -->
    <script type="text/javascript" src="lib/jquery/jquery-1.6.4.min.js"></script>

    <!-- History.js -->
    <script>if ( typeof window.JSON === 'undefined' ) { document.write('<script type="text/javascript" src="lib/history.js/json2.js"><\/script>'); }</script>
    <script type="text/javascript" src="lib/history.js/amplify.store.js"></script>
    <script type="text/javascript" src="lib/history.js/history.adapter.jquery.js"></script>
    <script type="text/javascript" src="lib/history.js/history.js"></script>
    <script type="text/javascript" src="lib/history.js/history.html4.js"></script>

    <!-- pseudositer -->
    <script type="text/javascript" src="lib/pseudositer/pseudositer.js"></script>
    <script type="text/javascript">
      $(document).ready(function() {
          $('#pseudositer').pseudositer('path/to/content/index/');
      });
   </script>
  </head>
  <body>
    <div id="pseudositer" />
  </body>
</html>
###

(($) ->

  ###
  # Utility functions
  ###

  # Log an object
  #
  # @param obj the {Object} to log
  log = ( obj ) ->

    if console?
      if console.log?
        console.log obj

    undefined

  # Generate an image element wrapped in a link to the image
  #
  # @param pathToImage the path to the image
  #
  # @return {Promise} that resolves with a single argument that
  # is an image tag wrapped in a link to the image.
  loadImage = ( pathToImage ) ->
    new $.Deferred()
      .resolve $( 'a' ).attr 'href', pathToImage
        .append $( 'img' ).attr 'src', pathToImage
      .promise()

  # Generate a div with text from a text file
  #
  # @param pathToText the path to the text file
  #
  # @return {Promise} that resolves with a single argument
  # that is a div tag with the content of the text file
  loadText = ( pathToText ) ->
    dfd = new $.Deferred ->
      $.get pathToText, ( responseText ) =>
        dfd.resolve $( 'div' ).text responseText

  # Get the current path without the filename
  #
  # @return {String} the currently displayed path, without the
  # file name
  getPathWithoutFilename = ->
    path = location.pathname

    # if there's a file at the end, lop it off.
    if getSuffix( path )?
      ary = path.split '/'
      ary[ 0...ary.length - 1 ].join( '/' ) + '/'
    else
      path

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

  # Obtain the lowercase file type suffix (after a period)
  #
  # @param path the path to the file
  #
  # @return {String} the lowercase suffix, or null if there is none.
  getSuffix = ( path ) ->
    splitBySlash = path.split '/'
    fileName = splitBySlash[ splitBySlash.length - 1 ]

    splitByDot = fileName.split('.')

    if splitByDot.length > 1
      splitByDot[ splitByDot.length - 1 ].toLowerCase()
    else
      null

  ###
  # Plugin code
  ###
  $.pseudositer = (el, rootPath, options) ->

    # Access to jQuery and DOM versions of element
    @el = el
    @$el = $ el

    # Add a reverse reference to the DOM object
    @$el.data "pseudositer", @

    # Cache of index elements by path.  Each value is an array of <a> elements.
    @pathIndices = {}

    # Cache of states by URL.  Each value is a {State}.
    @cachedStates = {}

    # Initialization code
    @init = () =>
      @options = $.extend {}, $.pseudositer.defaultOptions, options

      # Assign the root, ensure that it ends in '/'
      rootPath = if rootPath.charAt( rootPath.length - 1 ) is '/' then rootPath else "#{rootPath}/"
      if rootPath.charAt( 0 ) is '/'
        @rootPath = rootPath # absolute
      else
        @rootPath = getPathWithoutFilename() + rootPath # relative

      # Create loading div if one doesn't already exist,
      # and keep reference to the div.
      if $( @options.loadingClass ).length is 0
        @$loading = $( '<div>' ).addClass @options.loadingClass
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

      # Remember event callback so we can unbind it later
      # @eventCallback = () -> update()
        # log "fresh getstate: #{History.getState()}"
        # update History.getState()

      # Bind state change to callback
      History.Adapter.bind window, 'statechange', update

      # Immediately update view
      History.replaceState null, null, @rootPath

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

      # History.Adapter.bind may have registered either of these
      # $( window ).unbind 'hashchange', @eventCallback
      # $( window ).unbind 'popstate', @eventCallback

      # TODO specifically unbind our callback -- the callback is
      # wrapped in another function by History.Adapter, so this is
      # complicated.
      #$( window ).unbind 'hashchange'
      #$( window ).unbind 'popstate'

      this

    ###
    # Private methods.
    ###

    # Get the class name for an index of a specified level.
    #
    # @param level the {int} level, starting with 0, of the index.
    #
    # @return {String} the name of the class
    getIndexClassForLevel = ( level ) =>

      @options.indexClass + '-' + level

    # Construct the absolute path for an ajax request from a path from
    # the address bar.  Resolves the path against @rootPath.
    #
    # @param path a path from the address bar
    #
    # @return {String} a path that can be used for an ajax request.
    getAbsPath = (path) =>

      # @rootPath always ends in '/'
      if path.charAt( 0 ) is '/' then @rootPath + path.substr 1 else @rootPath + path

    # Show the loading notice
    #
    # @return {Promise} that is done once the loading notice is visible
    showLoading = =>
      dfd = new $.Deferred()
      @$loading.show 'fast', -> dfd.resolve()
      dfd.promise()

    # Hide the loading notice
    #
    # @return {Promise} that is done once the loading notice is hidden
    hideLoading = =>
      dfd = new $.Deferred()
      @$loading.hide 'fast', -> dfd.resolve()
      dfd.promise()

    # Update browser to display the view associated with the current state.
    # Will check the cache to see if this state has been loaded before.
    #
    # @return this
    update = ( ) =>
      log "updating"
      state = History.getState()

      # History.replaceState( state )

      # if we've visited the state before and grabbed data, reuse that object
      if @cachedStates[ state.url ]?
        state = @cachedStates[ state.url ]

      # store state in cache if it has pseudositer data.
      else
        if state.data.pseudositer?
          @cachedStates[ state.url ] = state

      # if we already have content data for state, use it
      if state.data.pseudositer?

        showIndices state.url
        showContent state.data.pseudositer.$content

      else # load the data for the state
        showLoading()

        dfd = new $.Deferred()
        log "loading"

        # resolve deferred from loading state
        $.when( load state )
          .done( (newState) -> dfd.resolve newState )
          .fail( (errObj)   -> dfd.reject  errObj ) # TODO error handling

        # reject deferred on timeout
        setTimeout ( => dfd.reject "Timeout after #{@options.timeout} ms" ), @options.timeout

        $.when( dfd )
          .done( (newState) -> History.replaceState newState ) # this will call #update again
          .fail( (errObj) -> log errObj )
          .always( =>
            hideLoading()
            log "should have triggered #{@options.alwaysEvent} on #{@$el.attr('id')}"
            @$el.triggerHandler @options.alwaysEvent
          )

      this

    # Obtain a {Promise} object that, once done, has loaded and cached
    # (into @pathIndices) all the paths leading to the supplied state's content,
    # and also loads the content into that state.
    #
    # @param state the {State} to load
    #
    # @return {Promise} object that, when finished, means that
    # data has been loaded into cache and state.  Callbacks receive
    # the new {State} as an argument.
    load = ( state ) =>

      dfd = new $.Deferred()
      url = state.url

      trails = getTrails url

      # pipe an additional request for any trails that are not in the cache
      for level in [ 0...trails.length ]

        trail = trails[ level ]
        unless @pathIndices[ trail ]?
          dfd = dfd.pipe loadIndex trail

      path = trails[ trails.length - 1 ]

      # unfold the path to content.  once the path is unfolded,
      # load the content.  once the content is loaded, resolve
      # the deferred with a new state based off of the content
      # and unfolded path.
      log "pre-unfolded path: #{path}"
      $.when( unfold( path ) ).done ( unfoldedPath ) ->
        log "unfolded path: #{unfoldedPath}"

        loadContent( unfoldedPath )
          .done ( $content ) ->
            newState = History.createStateObject
              pseudositer :
                $content  : $content,
              null,
              unfoldedPath
            log "newState #{newState}"
            dfd.resolve newState
          .fail ( failObj ) ->
            dfd.reject failObj

      dfd.promise()

    # Asynchronously determine the nearest content to this path,
    # loading indices into cache all along the way.
    #
    # @param path the path to unfold
    # @param dfd An optional {Deferred} to resolve once the unfolding
    # is done.  By default creates a new {Deferred}
    #
    # @return {Promise} that will be resolved with an argument
    # that is the unfolded path
    unfold = ( path, dfd = new $.Deferred() ) =>

      # if path already points to content, resolve the deferred
      if getSuffix( path ) isnt null

        dfd.resolve path
      else

        # when the index is loaded, call unfold again using the first
        # link and reusing the deferred object
        $.when( loadIndex( path ) ).done ( $links ) =>
          log "$links: #{$links.toString()}"
          if $links.length is 0 # empty index page
            dfd.reject "#{path} has no content"
          else
            unfold $links.first().attr( 'href' ), dfd

      dfd.promise()

    # If there is no entry for the index,
    # make an ajax request for a path to the index page, and cache
    # all the links on that index page into @pathIndices.
    #
    # @param path the path to an index page
    #
    # @return {Promise} which will resolve with an
    # argument that is an array of all the links in that index
    loadIndex = ( path ) =>
      dfd = new $.Deferred()
      if @pathIndices[ path ]?
        dfd.resolve @pathIndices[ path ]
      else
        $.when $.get getAbsPath path, ( responseText ) =>
          @pathIndices[ path ] = $( data ).find options.linkSelector
          dfd.resolve( @pathIndices [ path ] )
      dfd

    # Load the content located at a path
    #
    # @param pathToContent the path to the content
    #
    # @return {Promise} that resolves with a single argument of
    # fully loaded DOM content.  Will fail if there is no handler
    # for the file suffix.
    loadContent = ( pathToContent ) =>
      suffix = getSuffix pathToContent

      # use the handler in @options.map
      if @options.map[ suffix ]?
        log "firing handler #{@options.map[ suffix ]}"
        @options.map[ suffix ] getAbsPath pathToContent
      else # log an error if there's no handler
        log "No handler for file suffix #{suffix}."
        dfd = new $.Deferred().reject().promise()

    # Show the index for an unfolded url, in addition to all its parent
    # index pages. This data should already have been loaded into
    # @pathIndices .
    #
    # @param url the URL to show links for
    #
    # @return this
    showIndices = ( url ) =>

      trails = getTrails url

      # mark all link elements as stale before we iterate through the
      # path
      $( '.' + @options.indexClass ).addClass @options.staleClass

      for level in [ 0...trails.length ]

        trail = trails[ level ]

        # If a class for the level is not on the page, create it
        levelClass = getIndexClassForLevel level
        $index = $( '.' + levelClass )
        if $index.length is 0
          $index = $( 'div' )
            .addClass @options.indexClass + ' ' + levelClass
            .data 'pseudositer', { }
          @$el.append $index

        # If the previous path is the same, leave the element alone
        # otherwise, change the path and append the links
        prevPath = $index.data( 'pseudositer' ).path
        unless trail is prevPath
          $index.empty()
          $index.data( 'pseudositer', path : trail )
          $index.append @pathIndices[ trail ]

        # ensure that this index element is not removed.
        $index.removeClass @options.staleClass

      # remove any index elements that are deeper than the new path
      $( '.' + @options.indexClass + '.' + @options.staleClass ).remove()

      this

    # Remove existing content and show new content.
    #
    # @param $content the DOM content to display.
    #
    # @return this
    showContent = ( $content ) =>
      $( @$content ).empty()
        .append( $content );
      this

    # call init, and return the output
    @init()

  # object literal containing default options
  $.pseudositer.defaultOptions =
    loadingClass   : 'pseudositer-load'
    contentClass   : 'pseudositer-content'
    staleClass     : 'pseudositer-stale'
    indexClass     : 'pseudositer-index'
    linkSelector   : 'a:not([href^="?"],[href^="/"])' # Find links from an index page that go deeper
    alwaysEvent    : 'pseudositer-always'
    timeout        : 500
    map :
      png : loadImage
      gif : loadImage
      jpg : loadImage
      jpeg: loadImage
      txt : loadText
      html: loadText

  $.fn.pseudositer = (rootPath, options) ->
    $.each @, (i, el) ->
      $el = ($ el)

      # Only instantiate if not previously instantiated.
      unless $el.data 'pseudositer'
        # call plugin on el with options, and set it to the data.
        # the instance can always be retrieved as element.data 'pseudositer'
        # You can do things like:
        # (element.data 'pseudositer').publicMethod1();
        $el.data 'pseudositer', new $.pseudositer el, rootPath, options
  undefined
)(jQuery)
