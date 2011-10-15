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

    'startUpdate' # ( evt, path ) Triggered when update begins
    'doneUpdate'  # ( evt ) Triggered when update is done

    'startLoading'  # ( evt, path ) Triggered when loading begins
    'failedLoading' # ( evt, path ) Triggered when loading fails
    'doneLoading'   # ( evt, path ) Triggered when loading has succeeded
    'alwaysLoading' # ( evt, path ) Triggered when loading finishes, whether it failed or succeeded

    'destroyIndex' # ( evt, dfd, aboveIndexLevel ) Triggered when indices above a certain level should be destroyed
    'createIndex'  # ( evt, dfd, path, $links ) Triggered when an index to a certain path should be created with the specified links

    'loadImage'    # ( evt, dfd($elem), pathToImage ) Triggered when an image should be loaded
    'loadText'     # ( evt, dfd($elem), pathToText ) Triggered when text should be loaded
    'loadHtml'     # ( evt, dfd($elem), pathToHtml ) Triggered when HTML should be loaded
    'loadDefault'  # ( evt, dfd($elem), pathToFile ) Triggered when a file should be loaded
    'hideContent'  # ( evt, dfd ) Triggered when existing content should be hidden
    'showContent'  # ( evt, dfd, $content ) Triggered when new content should be shown
    'showError'    # ( evt, errObj ) Triggered when an error should be displayed

    'destroy'      # ( evt ) Triggered after a call to `destroy()`, but before handlers are unbound.
  ]

  ###
  #
  # Static class names for default handlers
  #
  ###
  contentClass = 'pseudositer-content'
  staleClass   = 'pseudositer-stale'
  indexClass   = 'pseudositer-index'
  indexContainerClass = 'pseudositer-index-container'
  loadingClass = 'pseudositer-loading'
  errorClass   = 'pseudositer-error'
  linkClass    = 'pseudositer-link'

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

  # Determine how many levels deep an absolute path is
  #
  # @param path the {String} absolute path to check
  #
  # @return {int} how many levels deep the path is
  getPathDepth = ( path ) ->

    path.split( '/' ).length - 2

  # Determine whether a path points to a file or a directory.
  #
  # @param path the {String} path to investigate
  #
  # @return {boolean} True if the path is a file, False otherwise.
  isPathToFile = ( path ) ->
    if @logging then log "isPathToFile( #{path} )"

    if path.charAt( path.length - 1 ) isnt '/' then true else false

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

  # Obtain the index level of an element from its class
  #
  # @param $elem the index element to get the level of
  #
  # @return {int} the level of the index
  getIndexLevel = ( $elem ) ->

    classes = $elem.attr( 'class' ).split( /\s+/ )

    for klass in classes
      match = klass.match new RegExp "#{indexClass}-(\\d)"
      if match?
        return match[ 1 ] # return the digit in the first backreference

    throw "Could not find an index level in classes #{classes}"

  # Retrieve the content container for a pseudositer element. Creates it if
  # it does not exist yet
  #
  # $pseudositer the pseudositer element
  #
  # @return {DOM} element for content
  getContentContainer = ( $pseudositer ) ->
    # Find a container if we have one, create one otherwise.
    $container = $('.' + contentClass)
    if $container.length is 0
      $container = $('<div />').addClass( contentClass ).appendTo( $pseudositer )

    $container

  # Retrieve the index container for a pseudositer element. Creates it if
  # it does not exist yet
  #
  # $pseudositer the pseudositer element
  #
  # @return {DOM} element for content
  getIndexContainer = ( $pseudositer ) ->
    # Find a container if we have one, create one otherwise.
    $container = $('.' + indexContainerClass )
    if $container.length is 0
      $container = $('<div />').addClass( indexContainerClass ).prependTo( $pseudositer )

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

  # Remove the extension from a path.  Does not modify paths to indices.
  #
  # Example:
  #   clipExtension( '/path/to/file.html' ) -> '/path/to/file'
  #   clipExtension( 'file.html' ) -> 'file'
  #   clipExtension( '/path/to/index/' ) -> '/path/to/index/'
  #
  # @param path the {String} path to clip the extension from
  #
  # @return {String} the path without the file extension
  clipExtension = ( path ) ->

    if isPathToFile path
      pathAry = path.split '/'

      fileNameAry = pathAry[ pathAry.length - 1 ].split '.'
      fileNameWithoutExtension = fileNameAry[ 0...fileNameAry.length - 1 ].join '.'

      pathAry = pathAry[ 0...pathAry.length - 1 ]
      pathAry.push fileNameWithoutExtension

      pathAry.join '/'

    else
      path

  ###
  #
  # Default handlers -- these are all called with the pseudositer object
  # as this.
  #
  ###

  # Show the default loading notice
  #
  # @param evt the event that called this handler.
  # @param path the path that caused the loading
  showLoadingNotice = ( evt, path ) ->
    if @logging then log "showLoadingNotice( #{path} )"

    # $container = getContentContainer this
    classForPath = getClassForPath path

    # Loading notice fades in, is linked to spawning path
    $loadingNotice = $( '<div />' ).hide()
      .text( "Loading #{path}..." )
      .addClass( "#{loadingClass} #{classForPath}" )
      .appendTo( this )
      .fadeIn( 'fast' )

    undefined

  # Hide the default loading notice
  #
  # @param evt the event that called this handler.
  # @param path the path that caused the loading.  If not specified,
  # removes all loading notices.
  hideLoadingNotice = ( evt, path ) ->
    if @logging then log "hideLoadingNotice( #{path} )"

    if path?
      classForPath = getClassForPath path
      $elem = $(".#{loadingClass}.#{classForPath}")
    else
      $elem = $(".#{loadingClass}");

    # fade out notice, then remove
    $elem.fadeOut 'fast', -> $elem.remove()

    undefined

  # Destroy index elements that are at a deeper level than the new view.
  #
  # @param evt the event that called this handler.
  # @param dfd A {Deferred} to resolve when the indices are destroyed
  # @param aboveIndexLevel the {int} level above which indices should be
  # destroyed
  destroyIndex = ( evt, dfd, aboveIndexLevel ) ->
    if @logging then log "destroyIndex( #{dfd}, #{aboveIndexLevel} )"

    # pipe each destruction onto this
    destroyed = new $.Deferred().resolve()

    # look through all of the indices, remove those with levels above
    # aboveIndexLevel
    $( '.' + indexClass ).each ( idx, elem ) ->
      $index = $ elem
      if getIndexLevel( $index ) > aboveIndexLevel
        # Deferred for a single level
        idxDestroy = new $.Deferred ( idxDestroy ) ->
          $index.fadeOut 'slow', () ->
            # $index.remove()
            idxDestroy.resolve()

        destroyed = destroyed.pipe -> idxDestroy

    # when all destroying is done, resolve the original deferred.
    destroyed.done( () -> dfd.resolve() )

    undefined

  # Create an index element to hold links if it does not already exist.
  #
  # @param evt the event that called this handler.
  # @param dfd A {Deferred} to resolve when the index is drawn
  # @param path the path to the index
  # @param $links an array of {DOM} links
  createIndex = ( evt, dfd, path, $links ) ->
    if @logging then log "createIndex( #{dfd}, #{path}, #{$links} )"
    indexLevel = path.split( '/' ).length - 2

    # If an element with the index level's class is not on the page,
    # create a div with the class, which is initially hidden
    levelClass = getIndexClassForLevel indexLevel
    $index = $( '.' + levelClass )
    if $index.length is 0
      $index = $( '<div />' )
        .addClass( indexClass + ' ' + levelClass )
        .hide()
      getIndexContainer( this ).append $index

    # create data in index if there is none
    unless $index.data 'pseudositer'
      $index.data 'pseudositer', {}

    # If the previous path is the same, make sure the element is shown
    # and resolve immediately.
    prevPath = $index.data( 'pseudositer' ).path
    # lock = $index.data( 'pseudositer' ).lock # in the midst of animation
    # if path is prevPath
    #   dfd.resolve()
    # else # otherwise, change the path, empty, and append new links, then resolve
      # fade out old index, slowly, then insert new one

    # show index and resolve supplied deferred
    showIndex = new $.Deferred().done ->
      $index.fadeIn( 'slow', -> dfd.resolve() )

    # if the path is the same as already available, show right away
    if path is prevPath
      showIndex.resolve()
    else # otherwise, modify the element then resolve
      $index.fadeOut 'slow', ->
        $index.empty()
          .data( 'pseudositer', path : path )
          .append( $links )
        showIndex.resolve()

    undefined

  # Resolve deferred with an image element wrapped in a link to the image
  #
  # @param evt the event that called this handler.
  # @param dfd A {Deferred} to resolve with the image when it is loaded
  # @param pathToImage the path to the image
  loadImage = ( evt, dfd, pathToImage ) ->
    if @logging then log "loadImage( #{dfd}, #{pathToImage} )"

    # temp div to force-load image
    $tmp = $( '<div />' )
      .css( height: '0px', width: '0px' )
      .appendTo $( 'body' )

    # create the image wrapped in link
    $img = $( '<a />' ).attr( 'href', pathToImage ).append(
          $( '<img />' )
          .attr( 'src', pathToImage )
          # only resolve deferred upon loading, and destroy $tmp at that point too
          #.bind( 'onload', ->
          .bind( 'load', ->
            dfd.resolve( $img )
            $tmp.remove()
          ) )

    undefined

  # Resolve deferred with text from a file inside <pre>.
  #
  # @param evt the event that called this handler.
  # @param dfd A {Deferred} to resolve with a div with the text when loaded.
  # @param pathToText the path to the text file
  loadText = ( evt, dfd, pathToText ) ->
    if @logging then log "loadText( #{dfd}, #{pathToText} )"

    $.get( pathToText )
      .done( ( responseText ) -> dfd.resolve $( '<div />' ).append($('<pre />').text responseText ) )
      .fail( ( errObj )       -> dfd.reject  errObj.statusText )

    undefined

  # Resolve deferred with the DOM from an HTML file.
  #
  # TODO: make sure sure that only the body is loaded.
  #
  # @param evt the event that called this handler.
  # @param dfd A {Deferred} to resolve with the HTML when loaded.
  # @param pathToHtml the path to the html file
  loadHtml = ( evt, dfd, pathToHtml ) ->
    if @logging then log "loadHtml( #{dfd}, #{pathToHtml} )"

    $.get( pathToHtml )
      .done( ( responseText ) -> dfd.resolve $ responseText )
      .fail( ( errObj )       -> dfd.reject  errObj.statusText )

    undefined

  # Resolve deferred with an absolute link to the file.
  #
  # @param evt the event that called this handler.
  # @param dfd A {Deferred} to resolve with the link.
  # @param pathToFile the path to the file
  download = ( evt, dfd, pathToFile ) ->
    if @logging then log "download( #{dfd}, #{pathToFile} )"

    dfd.resolve $( '<a />' ).text( pathToFile ).attr 'href', pathToFile

    undefined

  # Hide existing content
  #
  # @param evt the event that called this handler.
  # @param dfd the {Deferred} to resolve when the element is hidden
  hideContent = ( evt, dfd ) ->
    if @logging then log "hideContent( #{dfd} )"
    # content is all the children of the content container
    $content = getContentContainer( this ).children()

    # resolve immediately if there's no content to hide
    if $content.length is 0
      dfd.resolve()
    else # wait for content to disappear otherwise.
      $content.fadeOut 'slow', ->
        $content.detach()
        dfd.resolve()

    undefined

  # Display an element within content
  #
  # @param evt the event that called this handler.
  # @param dfd the {Deferred} to resolve when the element is shown
  # @param $elem the element to display
  showContent = ( evt, dfd, $elem ) ->
    if @logging then log "showContent( #{dfd}, #{$elem} )"
    $container = getContentContainer( this )
    # hide the element, append it to container
    $elem
      .hide().appendTo( $container )
      .fadeIn 'slow', -> dfd.resolve()
    undefined

  # Display an error message
  #
  # @param evt the event that called this handler.
  # @param errObj the error object
  showError = ( evt, errObj ) ->
    if @logging then log "showError( #{errObj} )"
    if @logging then log errObj

    $error = $( '.' + errorClass )
    # create error element if one doesn't exist
    if $error.length == 0

      $error = $( '<div />' ).addClass( errorClass )
        .appendTo getContentContainer( this )

    $error.text( errObj.toString() ).fadeIn( 'fast' )
    undefined

  # Remove the current error message
  #
  # @param evt the event that called this handler.
  hideError = ( evt ) ->
    if @logging then log "hideError( )"
    $error = $( '.' + errorClass )

    # hide quickly, then remove text
    $error.fadeOut( 'fast', -> $error.text( '' ) )

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

    # Cache of index pages and contents by path.
    # Each index page element is an array of <a> elements.
    # Each content element is DOM that can be appended to a content element.
    @cache = {}

    # Initialization code
    @init = () =>
      @options = $.extend {}, $.pseudositer.defaultOptions, options
      @map     = $.extend {}, $.pseudositer.defaultMap, map

      @visiblePath = getCurrentPath()
      @logging = @options.logging

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
          @$el.bind "#{event}.pseudositer", handler: handler, ( args... ) =>
            # have to pass handler through event data, otherwise we keep binding
            # the last handler in the map
            evt = args[ 0 ]
            evt.data.handler.apply( @$el, args )
            false

      # Immediately update view
      update()

      # return this
      this

    ###
    #
    # Public methods
    #
    ###

    # Change the recursion state to the specified value, and trigger update
    #
    # @param recursion a {Boolean} value to set recursion to
    #
    # @return this
    @setRecursion = ( recursion ) =>
      if @logging then log( "setRecursion( #{recursion} )" );

      if ( recursion is true or recursion is false ) and @options.recursion isnt recursion
        @options.recursion = recursion
        update()
      else
        throw 'new value for recursion must be true or false'

      this

    # Destroy pseudositer & remove all its content.
    #
    # @return this
    @destroy = =>
      if @logging then log( "destroy( )" );

       # Empty out the original element and unbind events
      # after sending destroy event
      $( window ).unbind 'hashchange', update
      @$el.empty()

      # Remove the data element
      @$el.removeData 'pseudositer'

      # Reset the page fragment
      document.location.hash = "";

      trigger 'destroy'
      @$el.unbind '.pseudositer'
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
    # @param args a splat of arguments to pass
    #
    # @return this
    trigger = ( eventName, args... ) =>
      if @logging then log "trigger( #{eventName}, #{args} )"

      @$el.triggerHandler "#{eventName}.pseudositer", args
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
      if @logging then log "getAjaxPath( #{path} )"

      # path should start with '/'
      @realPath + path.substr 1

    # Update browser to display the view associated with the current fragment.
    # Will load, then change fragment (which will call {#update()} again) if
    # the content is not yet cached.
    #
    # @return this
    update = ( ) =>
      if @logging then log "update( )"

      # read the existing hash to find path
      path = getCurrentFragment()

      # nonexistent path is "/", break out of function to prevent redundancy
      if path is ''
        document.location.hash = '/'
        return

      # make sure path in fragment is absolute
      if path.charAt( 0 ) isnt '/'
        document.location.hash = "/#{path}"
        return

      # redirect to file if recursion is true and not pointing to file already
      if @options.recursion is true and isPathToFile( path ) isnt true
        redirectToFile( path )
        return

      trigger 'startUpdate', path

      updateDfd = new $.Deferred()
        .done(             -> trigger 'doneUpdate' )
        .fail( ( failObj ) -> trigger 'showError', failObj )
        .always(           -> trigger 'alwaysUpdate' )

      # load the path if it's not already cached
      if @cache[ path ]?
        loaded = new $.Deferred().resolve()
      else
        loaded = load( path )

      # force end loading after timeout
      setTimeout (
         => updateDfd.reject "Load timeout after #{@options.timeout} ms"
      ), @options.timeout

      loaded
        .fail( ( failObj ) -> updateDfd.reject failObj )
        .done( () =>
          # always show indices
          showIndices path

          # Actions to perform after content is hidden
          contentHidden = new $.Deferred()
            .fail( ( failObj ) -> updateDfd.reject failObj )
            .done( () =>

              # only show content if the path points to content
              if isPathToFile path
                $content = @cache[ path ]
                contentShown = new $.Deferred()
                  .done( ()          -> updateDfd.resolve() )
                  .fail( ( failObj ) -> updateDfd.reject failObj )

                # When hide content is done, trigger show content
                trigger 'showContent', contentShown, $content

              else # otherwise resolve update process immediately
                updateDfd.resolve() )

          # trigger hideContent after filter has been added
          trigger 'hideContent', contentHidden )

      this

    # Obtain a {Promise} object that, once done, means that
    # @cache has all the paths leading to the supplied path's content,
    # as well as the content (if applicable).
    #
    # @param path the original path to load
    #
    # @return {Promise} object that, when done, means that
    # content and indices have been loaded into @cache.
    load = ( path ) =>
      if @logging then log "load( #{path} )"

      trigger 'startLoading', path

      promises = []

      # if the path is pointing to a file, then load the file.
      if isPathToFile path
        promises.push loadContent path

      # Make sure that any pre-specified trails are in our cache.
      trails = getIndexTrail path

      # request any trails leading to path
      for trail in trails[ 0..trails.length - 1 ]
        # start loading the index now
        promises.push loadIndex trail

      # if only jQuery let us pass an array of deferreds to $.when
      progress = $.when.apply(@, promises)
        .done( () ->
          trigger 'doneLoading', path )
        .fail( (errObj) ->
          trigger 'failedLoading', path )
        .always( ->
          trigger 'alwaysLoading', path )

    # Redirect to the nearest file contained in this path,
    # loading indices into cache all along the way.
    #
    # The 'nearest' file is found by following the first
    # link on each index page until that link is a file
    #
    # @param path the path to unfold
    #
    # @return this
    redirectToFile = ( path ) =>
      if @logging then log "redirectToFile( #{path} )"

      # redirect to content if we have a file
      if isPathToFile path
        document.location.hash = path
      else
        # when the index is loaded, call unfold again using the first
        # link and reusing the deferred object
        loadIndex( path )
          .done( () =>
            $links = @cache[ path ]
            if $links.length is 0 # empty index page
              trigger 'showError', "#{path} has no content"
            else # the link attr is already hashified
              redirectToFile $links.first().attr( 'href' ).substr( 1 ) )
          .fail( (errObj) -> trigger 'showError', errObj )

      this

    # If there is no entry for the index,
    # make an ajax request for a path to the index page, and cache
    # all the links on that index page into @cache.
    #
    # @param indexPath the path to an index page
    #
    # @return {Promise} which will resolve when the index is loaded,
    # or immediately if it was cached.
    loadIndex = ( indexPath ) =>
      if @logging then log "loadIndex( #{indexPath} )"

      dfd = new $.Deferred()

      # if the index is cached, use the links stored there and resolve
      # immediately
      if @cache[ indexPath ]?
        dfd.resolve()

      # otherwise, load the index and resolve once that's done
      else
        $.get( getAjaxPath( indexPath ), ( responseText ) =>

          # scope this here, because when we edit links we lose access to @
          showExtension = @options.showExtension

          # hashify href tags, add class
          $links = $( responseText )
            .find( @options.linkSelector )
            .addClass( linkClass )
            .text ( idx, oldValue ) ->
              # the index may clip the full name, so use the decoded attr
              fullName = decodeURI $( this ).attr 'href'

              # Remove the extension if we're supposed to
              if showExtension is false
                fullName = clipExtension fullName
              fullName
            .attr 'href', ( idx, oldValue ) ->
              # use old value as hash if absolute
              if oldValue.charAt( 0 ) is '/'
                '#' + decodeURI( oldValue )
              # resolve against index path otherwise
              else
                '#' + decodeURI( indexPath + oldValue )

          @cache[ indexPath ] = $links

          # only resolve once the cache is actually updated
          dfd.resolve()
        ) #.done( () -> dfd.resolve() )
         .fail( () -> dfd.reject "Could not load index page for #{indexPath}" )

      dfd.promise()

    # Load the content located at a path
    #
    # @param pathToContent the pseudopath to the content
    #
    # @return {Promise} that resolves when content loaded into @cache.
    # Will fail if there is a problem loading the content.
    loadContent = ( pathToContent ) =>
      if @logging then log "loadContent( #{pathToContent} )"

      dfd = new $.Deferred()
      suffix = getSuffix pathToContent

      # Use the handler in @map if we have one, default otherwise
      handler = if @map[ suffix ]? then @map[ suffix ] else @map[ '' ]
      trigger handler, dfd, getAjaxPath( pathToContent )
      dfd.done( ( $content ) =>
        # save to @cache upon success
        @cache[ pathToContent ] = $content
        # resolve the deferred
        dfd.resolve() )
      .fail( ( errObj ) -> dfd.reject errObj )

      dfd.promise()

    # Show the index for an unfolded path, in addition to all its parent
    # index pages. This data should already have been loaded into
    # @cache .
    #
    # @param path the path to show links for
    #
    # @return {Promise} that is resolved when all the indices are visible
    showIndices = ( path ) =>
      if @logging then log "showIndices( #{path} )"

      # remove any index elements that are deeper than the new path
      indicesDestroyed = new $.Deferred()
      trigger 'destroyIndex', indicesDestroyed, getPathDepth path

      trails = getIndexTrail path

      # an array of promises whose last element will be resolved when
      # indexes are all created
      promises = [ indicesDestroyed.promise() ]
      # create indices once the old ones are destroyed, and consecutively
      # by piping deferreds.
      # for trail in trails
      $.each trails, (idx, trail) =>
        $links = @cache[ trail ]
        lastPromise = promises[ promises.length - 1 ]
        indexCreated = new $.Deferred()
        lastPromise.done =>
          trigger 'createIndex', indexCreated, trail, $links
        promises.push( indexCreated.promise() )

      promises[ promises.length - 1 ]

    # call init, and return the output
    @init()

  # default options
  $.pseudositer.defaultOptions =

    linkSelector   : 'a:not([href^="?"],[href^="/"],[href^="../"])' # Find relative links from an index page that go deeper

    # Default map between event handlers and static functions.
    # If any of these options are overriden, the static function
    # will not be called.  If you want to add a callback instead
    # of replacing the default functionality, bind your additional
    # callback to the event instead of passing it as an option.
    startUpdate : [ hideError ]
    doneUpdate  : [ ]

    startLoading  : [ showLoadingNotice ]
    failedLoading : [ ]
    doneLoading   : [ ]
    alwaysLoading : [ hideLoadingNotice ]

    destroyIndex: [ destroyIndex ]
    createIndex : [ createIndex ]

    loadImage   : [ loadImage ]
    loadText    : [ loadText ]
    loadHtml    : [ loadHtml ]
    loadDefault : [ download ]
    hideContent : [ hideContent ]
    showContent : [ showContent ]
    showError   : [ showError ]

    destroy     : [ hideLoadingNotice, hideError ]

    # Whether to log function calls
    logging     : true

    # How many milliseconds to wait between the start of loading and
    # when loading is resolved.
    timeout    : 10000

    # If recursion is true, directories recursively open until content
    # or an empty directory is found.
    recursion  : false

    # If showExtension is true, links to content display their extension
    showExtension : false

  # Default map between file extensions and event handlers.
  # In addition to the event object, any callbacks
  # bound to these events will receive a deferred and an absolute path to the
  # content that should be loaded.  When the callback is complete, the deferred
  # must be resolved or the loading will time out.
  $.pseudositer.defaultMap  =
    png : 'loadImage'
    gif : 'loadImage'
    jpg : 'loadImage'
    jpeg: 'loadImage'
    txt : 'loadText'
    html: 'loadHtml'
    ''  : 'loadDefault' # default handler

  $.fn.pseudositer = (hiddenPath, options, map = {}) ->

    # if the user specified map as part of their options hash, extend map.
    if options?.map?
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
