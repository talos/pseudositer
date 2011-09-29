###
# Pseudositer 0.0.4 content management for the lazy
#
# kudos to coffee-plate https://github.com/pthrasher/coffee-plate
###

(($) ->

  ###
  # Utility functions
  ###

  ###
  # Plugin code
  ###
  $.pseudositer = (el, options) ->

    # Access to jQuery and DOM versions of element
    @el = el
    @$el = $ el

    # Add a reverse reference to the DOM object
    @$el.data "pseudositer", @

    # Cache of visited states.
    @stateCache = { }

    # Initialization code
    @init = (rootUrl) =>
      @options = $.extend {}, $.pseudositer.defaultOptions, options

      # Create loading div if one doesn't already exist,
      # and keep reference to the div.
      if $(@options.loadingClass).length is 0
        @$loading = $('<div>').addClass( @options.loadingClass )
        @$el.append( @$loading )
      else
        @$loading = $( @options.loadingClass )

      # Initially loading div is hidden
      @$loading.hide()

      # Create content div if one doesn't already exist,
      # and keep reference to the div.
      if $(@options.contentClass).length is 0
        @$content = $('<div>').addClass( @options.contentClass )
        @$el.append( @$content )
      else
        @$content = $( @options.contentClass )

      # Bind state change to private methods.
      History.Adapter.bind( window, 'statechange', () =>

        savedStates = History.savedStates
        lastState   = savedStates[ savedStates.length - 2 ]
        curState    = savedStates[ savedStates.length - 1 ]

        if lastState is null
          updateState( curState )
        else
          handleStateChange( lastState, curState )
      )

      # Immediately update state
      updateState( History.getState() )

      # return this
      @

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

      @

    ###
    # Private methods.
    ###

    # Show the loading notice
    #
    # @return this
    showLoadingNotice = =>

      @$loading.show()
      @

    # Hide the loading notice
    #
    # @return this
    hideLoadingNotice = =>

      @$loading.hide()
      @

    # Load a URL using AJAX
    #
    # @param url the URL to load
    # @param callback a callback function that will be passed a jqXHR
    # object.
    # loader = $.Deferred() url, callback) ->
    #   $.get url, (data, textStatus, jqXHR) ->
    #     callback(jqXHR)

    #   undefined

    # Handle the change from one state to another.
    #
    # @param oldState the previous History.getState() object
    # @param newState the History.getState() object just moved to
    #
    # @return this
    handleStateChange = (oldState, newState) =>

      # TODO remove this
      console.log("#{oldState.cleanUrl} to #{newState.cleanUrl}")

      # If state actually changed, update the state.
      updateState( newState )  unless oldState.cleanUrl is newState.cleanUrl
      @

    # Update page to display a state.
    #
    # @param state the History.getState() object we are updating
    # to reflect
    #
    # @return this
    updateState = (state) =>

      # state is cached
      if state in stateCache
        displayContent( stateCache[ state ].content )

      # state is not cached.
      else
        loadNewState(state)

      @

    # Display a cached state
    #
    # @param directories
    # @param content
    displayState = (directories, content) =>

    # Load a new state into cache, fire trigger when the state is loaded.
    #
    # @param state the History.getState() object we are loading
    # into cache.
    #
    # @return this
    loadNewState = (state) =>

      @

    # Load a new directory listing into directory listing cache.
    #
    # @param directoryUrl
    #
    # @return
    loadDirectory = (directoryUrl) =>

      @

    displayDirectory = (level, links) =>

      @

    displayContent = (state) =>

      @


    # call init, and return the output
    @init()

  # object literal containing default options
  $.pseudositer.defaultOptions =
    loadingClass: 'pseudositer-load'
    contentClass: 'pseudositer-content'
    directoryClass: 'pseudositer-directory'

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
