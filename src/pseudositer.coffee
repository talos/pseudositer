###
# Pseudositer 0.0.4 content management for the lazy
#
# kudos to coffee-plate https://github.com/pthrasher/coffee-plate
###

(($) ->
  $.pseudositer = (el, options) ->

    # Access to jQuery and DOM versions of element
    @el = el
    @$el = $ el
    # Add a reverse reference to the DOM object
    @$el.data "pseudositer", @

    #fat arrow '=>' makes creating jq plugins much easier.
    @init = =>
      @options = $.extend {}, $.pseudositer.defaultOptions, options
      #
      # put your initialization code here.
      #

      # should immediately reload
      reload()

      # return this
      @

    ###
    # sample public method. Uncomment to use.
    # Be sure to use => for all funcs inside $.pseudositer
    # that way you'll maintain scope.
    # @publicMethod1 = (parameters) =>
      # pass
    ###

    ###
    # Private methods.
    reload = () =>
      ($ document).
    ###

    # call init, and return the output
    @init()

  # object literal containing default options
  $.pseudositer.defaultOptions =
    optionOne: 'value'
    optionTwo: 'value'

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
