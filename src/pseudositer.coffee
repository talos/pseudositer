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
  # Constants
  ###
  imageLoadEvent = 'image.load.pseudositer'
  textLoadEvent = 'text.load.pseudositer'

  ###
  # Static functions
  ###

  # Log an object.
  #
  # @param obj the {Object} to log
  log = ( obj ) ->

    if console?.log?
      console.log obj

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
    dfd
    undefined

  # Hide an element
  #
  # @param $elem the element to hide
  hide = ( $elem ) ->
    $elem.hide()
    undefined

  # Display an element
  #
  # @param $elem the element to display
  display = ( $elem ) ->
    $elem.show()
    undefined

  # Populate $elem with an error message
  #
  # @param $elem an element
  # @param errorMsg the error message
  displayFailure = ( $elem, errorMsg ) ->
    log "displayFailure( #{elem}, text )"

    $elem.text( errorMsg )
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
  # getFragmentFromUrl = ( url ) ->

  #   loc = url.indexOf( '#' )
  #   if loc > -1 then url.substr( loc + 1 ) else null

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

      # Create content div if one doesn't already exist,
      # and keep reference to the div.
      if $( '.' + @options.content ).length is 0
        @$content = $( '<div>' ).addClass @options.content
        @$el.append @$content
      else
        @$content = $( '.' + @options.content )

      # Bind hash change to callback
      $( window ).bind 'hashchange', update

      @$el
        # Bind default image loading
        .bind imageLoadEvent, ( dfd, path) -> loadImage dfd, path
        # Bind default text loading
        .bind textLoadEvent, ( dfd, path ) -> loadText  dfd, path

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

      # Unbind events
      # Empty out the original element and unbind events
      $( window ).unbind 'hashchange', update
      @$el.empty()
        .unbind imageLoadEvent
        .unbind textLoadEvent

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

      @options.index + '-' + level

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
        showContent @cachedContent[ path ]
        @$el.triggerHandler @options.loadedEvent

      else # load the data for the state
        @$el.triggerHandler @options.loadingEvent

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
          .fail( (errObj)     -> log errObj )

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
        @$el.triggerHandler @options.map[ suffix ], dfd, pathToContent
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
    # @return this
    showIndices = ( path ) =>
      log "showIndices( #{path} )"

      trails = getIndexTrail path

      # mark all link elements as stale before we iterate through the
      # path
      $( '.' + @options.index ).addClass @options.stale

      for level in [ 0...trails.length ]

        trail = trails[ level ]

        # If an element with the index level's class is not on the page,
        # create a div with the class
        levelClass = getIndexClassForLevel level
        $index = $( '.' + levelClass )
        if $index.length is 0
          $index = $( '<div />' )
            .addClass( @options.index + ' ' + levelClass )
            .data( 'pseudositer', { } )
          @$el.append $index

        # If the previous path is the same, leave the element alone
        # otherwise, change the path, empty, and append new links
        prevPath = $index.data( 'pseudositer' ).path
        unless trail is prevPath
          $index
            .empty()
            .data( 'pseudositer', path : trail )
            .append @pathIndices[ trail ]

        # ensure that this index element is not removed.
        $index.removeClass @options.stale

      # remove any index elements that are deeper than the new path
      $( '.' + @options.index + '.' + @options.stale ).remove()

      this

    # Clear the displayed content
    #
    # @return this
    clearContent = ( ) =>
      log "clearContent( )"

      $( @$content ).empty()

      this

    # call init, and return the output
    @init()

  # default options
  $.pseudositer.defaultOptions =
    content   : 'pseudositer-content'
    stale     : 'pseudositer-stale'
    index     : 'pseudositer-index'
    linkSelector     : 'a:not([href^="?"],[href^="/"])' # Find links from an index page that go deeper
    loadingEvent     : 'loading.pseudositer'
    loadedEvent      : 'loaded.pseudositer'
    finishedEvent    : 'finished.pseudositer'

    hideContentEvent : 'hide.content.pseudositer'
    showContentEvent : 'show.content.pseudositer'
    timeout          : 2000
    recursion        : true

  # Default handler map.  The handlers will be called with a deferred and
  # a path to the content with the named extension.
  $.pseudositer.defaultMap  =
    png : imageLoadEvent
    gif : imageLoadEvent
    jpg : imageLoadEvent
    jpeg: imageLoadEvent
    txt : textLoadEvent
    html: textLoadEvent

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
