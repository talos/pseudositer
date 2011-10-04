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

  # Get the path of the currently displayed location
  #
  # @return {String} the currently displayed path, without fragment
  getCurrentPath = ->
    path = document.location.pathname

  # Get the fragment of the currently displayed location
  #
  # @return {String} the currently displayed fragment, without the
  # leading '#'
  getCurrentFragment = ->
    fragment = document.location.hash.substr 1

  # Obtain the paths leading up to and including the path of the provided
  # path.  For example:
  #
  # getTrails( "/path/to/my/file.txt" ) ->
  #  ["/", "/path/to/", "/path/to/my/", "/path/to/my/file.txt"]
  #
  # if the last element of the returned array does not end with a '/', then
  # this path does not refer to a file.
  #
  # @param url an absolute URL
  #
  # @return {Array} An array of paths, starting with the most interior
  # path.
  getTrails = ( path ) ->

    log path
    ary = path.split '/'

    # the first path is always a '/'
    trail = ['/']

    # for each element after that before the last, append it to the trail with a trailing
    # '/'
    trail.push( '/' + ary[ 0..i ].join( '/' ) + '/' ) for i in [ 1...ary.length - 1 ]

    # if the path leads to a file, append it without a trailing slash.
    if ary[ ary.length - 1 ] isnt ''
      trail.push '/' + ary.join '/'

    trail

  # Obtain the fragment portion of a URL, or null if there is none
  #
  # For example:
  #   getFragmentFromUrl(/path/without/fragment)     =>  null
  #   getFragmentFromUrl(/path/with/fragment/#)      =>  ""
  #   getFragmentFromUrl(/path/with/fragment/##)     =>  "#"
  #   getFragmentFromUrl(/path/with/fragment/#word)  =>  "word"
  #
  # @param url the url
  #
  # @return {String} the fragment, or null if there is none
  getFragmentFromUrl = ( url ) ->

    loc = url.indexOf( '#' )
    if loc > -1 then url.substr( loc + 1 ) else null

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
  $.pseudositer = (el, hiddenPath, options) ->

    # Access to jQuery and DOM versions of element
    @el = el
    @$el = $ el

    # TODO better method of unbinding events
    @destroyed = false

    # Add a reverse reference to the DOM object
    @$el.data "pseudositer", @

    # Cache of index elements by path.  Each value is an array of <a> elements.
    @pathIndices = {}

    # Cache of states by URL.  Each value is a {State}.
    @cachedStates = {}

    # Initialization code
    @init = () =>
      @options = $.extend {}, $.pseudositer.defaultOptions, options

      @visiblePath = getCurrentPath()

      # Ensure the hidden path ends in '/'
      hiddenPath = if hiddenPath.charAt( hiddenPath.length - 1 ) is '/' then hiddenPath else "#{hiddenPath}/"

      # Assign real path
      if hiddenPath.charAt( 0 ) is '/'
        @realPath = hiddenPath
      else
        # eliminate current file name when constructing real path
        if getSuffix( @visiblePath )?
          split = @visiblePath.split( '/' )
          @realPath = split[ 0...split.length - 1 ].join( '/' ) + '/' + hiddenPath
        else # make sure that relative hidden path is joined without a redundant slash to visible path
          if @visiblePath.charAt( @visiblePath.length - 1 ) is '/'
            @realPath = @visiblePath + hiddenPath
          else
            @realPath = @visiblePath + '/' + hiddenPath

      # Create loading div if one doesn't already exist,
      # and keep reference to the div.
      if $( '.' + @options.loadingClass ).length is 0
        @$loading = $( '<div>' ).addClass @options.loadingClass
        @$el.append( @$loading )
      else
        @$loading = $ @options.loadingClass

      # Hide loading by default
      hideLoading()

      # Initially loading div is hidden
      @$loading.hide()

      # Create content div if one doesn't already exist,
      # and keep reference to the div.
      if $( '.' + @options.contentClass ).length is 0
        @$content = $( '<div>' ).addClass @options.contentClass
        @$el.append @$content
      else
        @$content = $( '.' + @options.contentClass )

      # Remember event callback so we can unbind it later
      # @eventCallback = () -> update()
        # log "fresh getstate: #{History.getState()}"
        # update History.getState()

      # Bind state change to callback
      History.Adapter.bind window, 'statechange', =>
        update() if @destroyed is false

      # Immediately update view
      update()

      # return this
      this

    ###
    # Public methods
    ###

    # Destroy pseudositer & remove all its content.
    #
    # @return this
    @destroy = =>

      # TODO better method of ignoring events
      @destroyed = true

      # Empty out the original element.
      @$el.empty()

      # History.Adapter.bind may have registered either of these
      # $( window ).unbind 'hashchange', @eventCallback
      # $( window ).unbind 'popstate', @eventCallback

      # TODO specifically unbind our callback -- the callback is
      # wrapped in another function by History.Adapter, so this is
      # complicated.
      # @$el.unbind 'hashchange'
      # @$el.unbind 'popstate'

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

    # Construct the absolute path for an ajax request from a fragment.
    # Resolves the fragment against the real path
    #
    # For example:
    # getAjaxPath( "/path/to/file.txt" ) ->
    #   "something/else/hidden/path/to/file.txt"
    #
    # @param fragment a fragment
    #
    # @return {String} a path that can be used for an ajax request.
    getAjaxPath = ( fragment ) =>
      # fragment should start with '/'
      @realPath + fragment.substr 1

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
      state = History.getState()

      fragmentPath = getFragmentFromUrl state.url

      # nonexistent fragmentPath is "/"
      fragmentPath = '/' if fragmentPath is null or fragmentPath is ''
      log "fragmentPath : #{fragmentPath}"

      # if we've visited the state before and grabbed data, reuse that object
      if @cachedStates[ fragmentPath ]?
        state = @cachedStates[ fragmentPath ]

      # store state in cache if it has pseudositer data.
      else
        if state.data.pseudositer?
          @cachedStates[ fragmentPath ] = state

      # if we already have content data for state, use it
      if state.data.pseudositer?
        log "state.data:"
        log state.data

        showIndices fragmentPath
        showContent state.data.pseudositer.$content

      else # load the data for the state
        showLoading()

        dfd = new $.Deferred()

        # resolve deferred when we have a new state
        $.when( load fragmentPath )
          .done( (newState) -> dfd.resolve newState )
          .fail( (errObj)   -> dfd.reject  errObj ) # TODO error handling

        # reject deferred on timeout
        setTimeout ( => dfd.reject "Timeout after #{@options.timeout} ms" ), @options.timeout

        # handle possible deferred completions
        $.when( dfd )
          .done( (newState) -> History.replaceState newState ) # this will call #update again
          .fail( (errObj) -> log errObj )
          .always( =>
            hideLoading()
            @$el.triggerHandler @options.alwaysEvent
          )

      this

    # Obtain a {Promise} object that, once done, has loaded and cached
    # (into @pathIndices) all the paths leading to the supplied path's content,
    # and also loads the content into a new state.
    #
    # @param path the path to load
    #
    # @return {Promise} object that, when done, means that
    # data has been loaded into cache and state.  Callbacks receive
    # the new {State} as an argument.
    load = ( path ) =>

      # Make sure that any pre-specified trails are in our cache.
      trails = getTrails path

      trailsToLoad = []
      # pipe an additional request for any trails that are not in the cache
      for level in [ 0...trails.length ]

        trail = trails[ level ]
        unless @pathIndices[ trail ]?
          trailsToLoad.push loadIndex( trail )

      trailsLoaded = $.when( trailsToLoad )

      # Make sure that our path leads to content.
      unfolded = $.Deferred()

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
            unfolded.resolve newState
          .fail ( failObj ) ->
            unfolded.reject failObj

      $.when( unfolded, trailsLoaded )

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

      # eliminate '#' if it slipped in at front
      path = path.substr 1 if path.charAt( 0 ) is '#'

      # if path already points to content, resolve the deferred
      if getSuffix( path )?
        dfd.resolve path
      else

        # when the index is loaded, call unfold again using the first
        # link and reusing the deferred object
        $.when( loadIndex( path ) )
          .done ( $links ) =>
            if $links.length is 0 # empty index page
              dfd.reject "#{path} has no content"
            else
              log "unfold #{$links.first().attr( 'href' )}"
              unfold $links.first().attr( 'href' ), dfd
          .fail ( failObj ) ->
            dfd.reject failObj

      dfd.promise()

    # If there is no entry for the index,
    # make an ajax request for a path to the index page, and cache
    # all the links on that index page into @pathIndices.
    #
    # @param indexPath the path to an index page
    #
    # @return {Promise} which will resolve with an
    # argument that is an array of all the links in that index
    loadIndex = ( indexPath ) =>
      dfd = new $.Deferred()

      # if the index is cached, use the links stored there and resolve
      # immediately
      if @pathIndices[ indexPath ]?
        dfd.resolve @pathIndices[ indexPath ]

      # otherwise, load the index and resolve once that's done
      else
        $.get getAjaxPath( indexPath ), ( responseText ) =>

          # hashify href tags
          $links = $( responseText )
            .find( @options.linkSelector )
            .attr 'href', ( idx, oldValue ) ->
              # use old value as hash if absolute, resolve against index path otherwise
              '#' + if oldValue.charAt( 0 ) is '/' then oldValue else indexPath + oldValue

          log $links
          @pathIndices[ indexPath ] = $links
        .done =>
          dfd.resolve( @pathIndices[ indexPath ] )
        .fail ->
          dfd.reject( "Could not load index page for #{indexPath}" )

      dfd.promise()

    # Load the content located at a path
    #
    # @param pathToContent the path to the content
    #
    # @return {Promise} that resolves with a single argument of
    # fully loaded DOM content.  Will fail if there is no handler
    # for the file suffix.
    loadContent = ( pathToContent ) =>
      suffix = getSuffix pathToContent
      log "suffix #{suffix}"

      # use the handler in @options.map
      if @options.map[ suffix ]?
        @options.map[ suffix ] getAjaxPath pathToContent
      else # log an error if there's no handler
        dfd = new $.Deferred().reject().promise()

    # Show the index for an unfolded path, in addition to all its parent
    # index pages. This data should already have been loaded into
    # @pathIndices .
    #
    # @param path the path to show links for
    #
    # @return this
    showIndices = ( path ) =>

      trails = getTrails path

      # mark all link elements as stale before we iterate through the
      # path
      $( '.' + @options.indexClass ).addClass @options.staleClass

      for level in [ 0...trails.length ]

        trail = trails[ level ]

        # If a class for the level is not on the page, create it
        levelClass = getIndexClassForLevel level
        $index = $( '.' + levelClass )
        log "#{levelClass}: levelClass"
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
      log "showContent"
      log @$content
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
    timeout        : 1000
    map :
      png : loadImage
      gif : loadImage
      jpg : loadImage
      jpeg: loadImage
      txt : loadText
      html: loadText

  $.fn.pseudositer = (hiddenPath, options) ->
    $.each @, (i, el) ->
      $el = ($ el)

      # Only instantiate if not previously instantiated.
      unless $el.data 'pseudositer'
        # call plugin on el with options, and set it to the data.
        # the instance can always be retrieved as element.data 'pseudositer'
        # You can do things like:
        # (element.data 'pseudositer').publicMethod1();
        $el.data 'pseudositer', new $.pseudositer el, hiddenPath, options
  undefined
)(jQuery)
