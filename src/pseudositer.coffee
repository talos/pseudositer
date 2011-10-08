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
  #
  # Static constant events
  #
  ###

  events = [
    'loading.pseudositer'       # ( spawningPath )
    'destroy.index.pseudositer' # ( dfd, aboveIndexLevel )
    'create.index.pseudositer'  # ( dfd, path, $links )
    'load.image.pseudositer'    # ( dfd($elem), pathToImage )
    'load.text.pseudositer'     # ( dfd($elem), pathToText )
    'hide.content.pseudositer'  # ( dfd, $content )
    'show.content.pseudositer'  # ( dfd, $content )
    'show.error.pseudositer'    # ( spawningPath, errMsg )
    'done.pseudositer'          # ( spawningPath, loadedPath )
    'always.pseudositer'        # ( spawningPath, loadedPath )
  ]

  ###
  #
  # Static class names for default handlers
  #
  ###
  contentClass = 'pseudositer-content'
  staleClass   = 'pseudositer-stale'
  indexClass   = 'pseudositer-index'
  loadingClass = 'pseudositer-loading'

  ###
  #
  # Static functions
  #
  ###

  # Log an object.
  #
  # @param obj the {Object} to log
  log = ( obj ) ->

    if console?.log?
      console.log obj

    undefined

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

  # Obtain the paths to indexes leading up to and including the path of the provided
  # index.  For example:
  #
  # getIndexTrail( "/path/to/my/file.txt" ) ->
  #  ["/", "/path/to/", "/path/to/my/" ]
  #
  # files at the end of the path are ignored.
  #
  # @param url an absolute URL
  #
  # @return {Array} An array of paths to indexes, starting with the most interior
  # index.

  getIndexTrail = ( path ) ->
    ary = path.split '/'

    # the first path is always a '/'
    trail = ['/']

    # for each element after that before the last, append it to the trail with a trailing
    # '/'
    trail.push( ary[ 0..i ].join( '/' ) + '/' ) for i in [ 1...ary.length - 1 ]

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

  # Retrieve the content container for a pseudositer element. Creates it if
  # it does not exist yet
  #
  # $pseudositer the pseudositer element
  #
  # @return {DOM} element for content
  getContentContainer = ( $pseudositer ) ->
    # Find a container if we have one, create one otherwise.
    $container = $('.' + contentClass)
    if( $container.length == 0 )
      $container = $('<div />').addClass( contentClass ).appendTo( $pseudositer )

    $container

  # Get the class name for an index of a specified level.
  #
  # @param level the {int} level, starting with 0, of the index.
  #
  # @return {String} the name of the class
  getIndexClassForLevel = ( level ) ->

    indexClass + '-' + level

  # Get a safe class name for a path
  #
  # @param path the {path} to turn into a class name
  #
  # @return {String} usable as class name
  getClassForPath = ( path ) ->

    path.replace(/[^A-Za-z0-9]/g, '-')

  ###
  #
  # Default handlers -- these are all called with the pseudositer object
  # as this.
  #
  ###

  # Show the default loading notice
  #
  # @param spawningPath the path that caused the loading
  showLoadingNotice = ( spawningPath ) ->
    $container = getContentContainer( this )
    classForPath = getClassForPath spawningPath
    $loadingNotice = $( '<div />' ).hide()
      .text( "Loading #{spawningPath}..." )
      .addClass( "#{loadingClass} #{classForPath}" )
      .appendTo( $container )
      .fadeIn( 'fast' )

    undefined

  # Hide the default loading notice
  #
  # @param spawningPath the path that caused the loading
  showLoadingNotice = ( spawningPath, loadedPath ) ->
    $container = getContentContainer( this )
    classForPath = getClassForPath spawningPath
    $elem = $(".#{loadingClass}.#{classForPath}")
      .fadeOut 'fast', -> $elem.remove()

    undefined

  # Destroy index elements that are at a deeper level than the new view.
  #
  # @param dfd A {Deferred} to resolve when the indices are destroyed
  # @param aboveIndexLevel the {int} level above which indices should be
  # destroyed
  destroyIndex = ( dfd, aboveIndexLevel ) ->
    $indices = $( '.' + indexClass )
    # pipe each destruction onto this
    destroyed = new $.Deferred().resolve()
    # look through all of the indices, remove those with levels above
    $.each($indices, function(idx, $index) {
      if $index.data( 'pseudositer' ).level > aboveIndexLevel
        # destroy the next level after the previous is done each time
        destroyed = destroyed.pipe ->
          $index.fadeOut 'slow', ->
            $index.remove()
            destroyed.resolve()
    });

    # when all destroying is done, resolve the original deferred.
    destroyed.done -> dfd.resolve()

    undefined

  # Create an index element to hold links if it does not already exist.
  #
  # @param dfd A {Deferred} to resolve when the index is drawn
  # @param path the path to the index
  # @param $links an array of {DOM} links
  createIndex = ( dfd, path, $links ) ->
    indexLevel = path.split( '/' ).length - 2

    # If an element with the index level's class is not on the page,
    # create a div with the class, which is initially hidden
    levelClass = getIndexClassForLevel indexLevel
    $index = $( '.' + levelClass )
    if $index.length is 0
      $index = $( '<div />' )
        .addClass( indexClass + ' ' + levelClass )
        .data( 'pseudositer', { } )
        .hide()
      this.append $index

    # If the previous path is the same, leave the element alone
    # and resolve immediately.
    prevPath = $index.data( 'pseudositer' ).path
    # lock = $index.data( 'pseudositer' ).lock # in the midst of animation
    if path is prevPath
      dfd.resolve()
    else # otherwise, change the path, empty, and append new links, then resolve
      # fade out old index, slowly, then insert new one
      $index.data( 'pseudositer', fadeOut('slow', ->
        $index.empty()
          .data( 'pseudositer', path : path, level : indexLevel )
          .append $links
          .fadeIn('slow', ->
            dfd.resolve()

    undefined

  # Populate $elem with an image element wrapped in a link to the image
  #
  # @param dfd A {Deferred} to resolve with the image when it is loaded
  # @param pathToImage the path to the image
  loadImage = ( dfd, pathToImage ) ->
    log "loadImage( #{dfd}, #{$elem}, #{pathToImage} )"

    # temp div to force-load image
    $tmp = $( '<div />' )
      .style( height: '0px', width: '0px' )
      .appendTo $( 'body' )

    # create the image wrapped in link
    $img = $( '<a />' ).attr( 'href', pathToImage ).append(
          $( '<img />' )
          .attr( 'src', pathToImage )
          # only resolve deferred upon loading, and destroy $tmp at that point too
          .bind( 'onload', ->
            dfd.resolve( $img )
            $tmp.remove()
          ) )

    undefined

  # Populate $elem with text from a file.
  #
  # @param dfd A {Deferred} to resolve with a div with the text when loaded.
  # @param pathToText the path to the text file
  loadText = ( dfd, pathToText ) ->
    log "loadText( #{$elem}, #{pathToText} )"

    dfd = new $.Deferred()
    $.get( pathToText )
      .done( ( responseText ) -> dfd.resolve $( '<div />' ).text responseText )
      .fail( ( failObj )      -> dfd.reject  failObj )

    undefined

  # Hide an element
  #
  # @param dfd the {Deferred} to resolve when the element is hidden
  # @param $elem the element to hide
  hideContent = ( dfd, $elem ) ->
    $elem.fadeOut('slow', ->
      $elem.remove()
      dfd.resolve() )

    undefined

  # Display an element within content
  #
  # @param dfd the {Deferred} to resolve when the element is shown
  # @param $elem the element to display
  showContent = ( dfd, $elem ) ->
    $container = getContentContainer( this )
    # hide the element, append it to container
    $elem
      .hide().appendTo( $container )
      .fadeIn('slow', -> dfd.resolve() )
    undefined

  # Populate $elem with an error message
  #
  # @param errorMsg the error message
  showError = ( errorMsg ) ->
    log "showError( #{errorMsg} )"

    $container = getContentContainer( this )

    $container.text( errorMsg )
    undefined

  ###
  #
  # Plugin object
  #
  ###
  $.pseudositer = (el, hiddenPath, options, map) ->

    # Access to jQuery and DOM versions of element
    # @el = el
    @$el = $ el

    # Add a reverse reference to the DOM object
    @$el.data "pseudositer", @

    # Cache of index elements by path.  Each value is an array of <a> elements.
    @pathIndices = {}

    # Cache of content by URL.  Each value is an element that can be appended to
    # $content.
    @cachedContent = {}

    # Initialization code
    @init = () =>
      @options = $.extend {}, $.pseudositer.defaultOptions, options
      @map     = $.extend {}, $.pseudositer.defaultMap, map

      @visiblePath = getCurrentPath()

      # Ensure the hidden path ends in '/'
      hiddenPath = "#{hiddenPath}/" unless hiddenPath.charAt( hiddenPath.length - 1 )

      # @realPath is used to resolve paths in the fragment
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

      # Bind hash change to callback
      $( window ).bind 'hashchange', update

      # Set up handlers
      for event in events
        for handler in @options[ event ]
          @$el.bind event, ( args... ) => handler.apply( @$el, args )

      # Immediately update view
      update()

      # return this
      this

    ###
    #
    # Public methods
    #
    ###

    # Destroy pseudositer & remove all its content.
    #
    # @return this
    @destroy = =>

      # Empty out the original element and unbind events
      $( window ).unbind 'hashchange', update
      @$el.empty().unbind '.pseudositer'

      this

    ###
    #
    # Private methods.
    #
    ###

    # Trigger an event on the pseudositer element (uses triggerHandler).
    # Adds ".pseudositer" namespace.
    #
    # @param eventName the name of the event, without namespace
    # @param arguments a splat of arguments to pass
    #
    # @return this
    trigger = ( eventName, arguments... ) =>
      @$el.triggerHandler "#{eventName}.pseudositer", arguments
      @

    # Construct the absolute path for an ajax request from an absolute
    # path that would have been found in a fragment.
    #
    # For example:
    # getAjaxPath( "/path/to/file.txt" ) ->
    #   "something/else/hidden/path/to/file.txt"
    #
    # @param path an absolute path
    #
    # @return {String} a path that can be used for an ajax request.
    getAjaxPath = ( path ) =>
      # path should start with '/'
      @realPath + path.substr 1

    # Update browser to display the view associated with the current fragment.
    # Only loads path indexes and content if it's not cached.
    #
    # @return this
    update = ( ) =>
      log "update( )"

      # read the existing hash to find path
      path = getCurrentFragment()

      # nonexistent path is "/", break out of function to prevent redundancy
      if path is ''
        document.location.hash = '/'
        return

      # if the content is cached, everything is ready to display.
      if @cachedContent[ path ]?
        showIndices path

        contentShown = new $.Deferred()
        contentHidden = new $.Deferred()

        # Start off by hiding the current content, calling back
        trigger 'hide.content' contentHidden

        # When hide content is done, trigger show content
        # if there's a failure, make sure alwaysEvent is called.
        contentHidden
          .done =>
            trigger 'show.content' contentShown, @cachedContent[ path ]
          .fail (failObj) ->
            trigger 'show.error' failObj
            trigger 'always'

        # When show content is done, trigger final doneEvent
        # and alwaysEvent.
        contentShown
          .done           => trigger 'done', path
          .fail (failObj) -> trigger 'show.error', failObj
          .always         => trigger 'always', path

      else # load the data for the state
        trigger 'loading', path

        progress = new $.Deferred()

        # unfold the path then load if recursion is true
        if @options.recursion is true
          unfold( path )
            # once the path is unfolded, load content and indexes for it
            .done( ( unfoldedPath ) ->
              load( unfoldedPath )
                .done(            -> progress.resolve unfoldedPath )
                .fail( (failObj)  -> progress.reject failObj ) )
            .fail( ( failObj ) -> progress.reject failObj )
        else # load the path immediately otherwise
          load( path )
            .done( -> progress.resolve path )
            .fail( (failObj)  -> progress.reject failObj )

        # reject deferred after timeout
        setTimeout (
           => progress.reject "Timeout after #{@options.timeout} ms"
        ), @options.timeout

        # handle possible deferred completions
        progress
          # when done with progress, update the fragment. this will force update,
          # and display the content.
          .done( (loadedPath) ->
            if path is loadedPath # force update, changing hash will do nothing
              update()
            else # update will happen due to hash change
              document.location.hash = loadedPath )
          .fail( (errObj) ->
            trigger 'show.error' errObj
            trigger 'always' )

      this

    # Obtain a {Promise} object that, once done, means that
    # @pathIndices has all the paths leading to the supplied path's content,
    # and that @cachedContent contains the content.
    #
    # @param path the path to load
    #
    # @return {Promise} object that, when done, means that
    # content has been loaded into @cachedContent and that indexes are
    # cached in @pathIndices
    load = ( unfoldedPath ) =>
      log "load( #{unfoldedPath} )"

      contentPromise = loadContent unfoldedPath
      dfd = new $.Deferred().resolve().pipe -> contentPromise

      # Make sure that any pre-specified trails are in our cache.
      trails = getIndexTrail unfoldedPath

      # request any trails leading to path
      for trail in trails[ 0..trails.length - 1 ]
        # start loading the index now
        indexPromise = loadIndex trail
        dfd = dfd.pipe -> indexPromise

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
      log "unfold( #{path}, #{dfd} )"

      # if path already points to content, resolve the deferred
      if getSuffix( path )?
        dfd.resolve path
      else

        # when the index is loaded, call unfold again using the first
        # link and reusing the deferred object
        $.when( loadIndex( path ) )
          .done =>
            $links = @pathIndices[ path ]
            if $links.length is 0 # empty index page
              dfd.reject "#{path} has no content"
            else
              # the link attr is hashified
              unfold $links.first().attr( 'href' ).substr( 1 ), dfd
          .fail ( failObj ) ->
            dfd.reject failObj

      dfd.promise()

    # If there is no entry for the index,
    # make an ajax request for a path to the index page, and cache
    # all the links on that index page into @pathIndices.
    #
    # @param indexPath the path to an index page
    #
    # @return {Promise} which will resolve when the index is loaded,
    # or immediately if it was cached.
    loadIndex = ( indexPath ) =>
      log "loadIndex( #{indexPath} )"

      dfd = new $.Deferred()

      # if the index is cached, use the links stored there and resolve
      # immediately
      if @pathIndices[ indexPath ]?
        dfd.resolve()

      # otherwise, load the index and resolve once that's done
      else
        $.get getAjaxPath( indexPath ), ( responseText ) =>

          # hashify href tags
          $links = $( responseText )
            .find( @options.linkSelector )
            .attr 'href', ( idx, oldValue ) ->
              # use old value as hash if absolute
              if oldValue.charAt( 0 ) is '/'
                '#' + oldValue
              # resolve against index path otherwise
              else
                '#' + indexPath + oldValue

          @pathIndices[ indexPath ] = $links
        .done =>
          dfd.resolve()
        .fail ->
          dfd.reject( "Could not load index page for #{indexPath}" )

      dfd.promise()

    # Load the content located at a path
    #
    # @param pathToContent the path to the content
    #
    # @return {Promise} that resolves when content loaded into @cachedContent.
    # Will fail if there is no handler for the file suffix or if there is a
    # problem loading the content.
    loadContent = ( pathToContent ) =>
      log "loadContent( #{pathToContent} )"

      dfd = new $.Deferred()
      suffix = getSuffix pathToContent

      # if @cachedContent[ pathToContent ]? # resolve immediately if already cached
      #   dfd.resolve()
      # Use the handler in @options.map
      if @options.map[ suffix ]?
        trigger @options.map[ suffix ], dfd, pathToContent
        dfd.done( ( $content ) =>
          # save to @cachedContent upon success
          @cachedContent[ pathToContent ] = $content
          # resolve the deferred
          dfd.resolve() )
        .fail( ( failObj ) -> dfd.reject failObj )
      else # log an error if there's no handler
        dfd.reject("No handler for content type " + suffix)

      dfd.promise()

    # Show the index for an unfolded path, in addition to all its parent
    # index pages. This data should already have been loaded into
    # @pathIndices .
    #
    # @param path the path to show links for
    #
    # @return {Promise} that is resolved when all the indices are visible
    showIndices = ( path ) =>
      log "showIndices( #{path} )"

      dfd = new $.Deferred().resolve()
      trails = getIndexTrail path

      for level in [ 0...trails.length ]

        trail = trails[ level ]
        dfd = dfd.pipe -> trigger 'create.index' dfd, level, @pathIndices[ trail ]



      # remove any index elements that are deeper than the new path
      trigger 'destroy.index', new $.Deferred(), trails.length

      dfd.promise()

    # call init, and return the output
    @init()

  # default options
  $.pseudositer.defaultOptions =

    linkSelector   : 'a:not([href^="?"],[href^="/"])' # Find links from an index page that go deeper

    # default handlers
    loading.pseudositer      : [ showLoadingNotice ]
    destroy.index.pseudositer: [ destroyIndex ]
    create.index.pseudositer : [ createIndex ]
    load.image.pseudositer   : [ loadImage ]
    load.text.pseudositer    : [ loadText ]
    hide.content.pseudositer : [ hideContent ]
    show.content.pseudositer : [ showContent ]
    show.error.pseudositer   : [ showError ]
    done.pseudositer         : []
    always.pseudositer       : [ hideLoadingNotice ]

    timeout          : 2000
    recursion        : true

  # Default handler map.  The handlers will be called with a deferred and
  # a path to the content with the named extension.
  $.pseudositer.defaultMap  =
    png : 'load.image'
    gif : 'load.image'
    jpg : 'load.image'
    jpeg: 'load.image'
    txt : 'load.text'
    html: 'load.text'

  $.fn.pseudositer = (hiddenPath, options, map = {}) ->

    # if the user specified map as part of their options hash, extend map.
    if options.map?
      $.extend map, options.map

    $.each @, (i, el) ->
      $el = ($ el)

      # Only instantiate if not previously instantiated.
      unless $el.data 'pseudositer'
        # call plugin on el with options, and set it to the data.
        # the instance can always be retrieved as element.data 'pseudositer'
        # You can do things like:
        # (element.data 'pseudositer').publicMethod1();
        $el.data 'pseudositer', new $.pseudositer el, hiddenPath, options, map
  undefined
)(jQuery)
