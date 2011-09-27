(function() {

  /*
  # Pseudositer 0.0.4 content management for the lazy
  #
  # kudos to coffee-plate https://github.com/pthrasher/coffee-plate
  */

  (function($) {
    $.pseudositer = function(el, options) {
      var _this = this;
      this.el = el;
      this.$el = $(el);
      this.$el.data("pseudositer", this);
      this.init = function() {
        _this.options = $.extend({}, $.pseudositer.defaultOptions, options);
        reload();
        return _this;
      };
      /*
          # sample public method. Uncomment to use.
          # Be sure to use => for all funcs inside $.pseudositer
          # that way you'll maintain scope.
          # @publicMethod1 = (parameters) =>
            # pass
      */
      /*
          # Private methods.
          reload = () =>
            ($ document).
      */
      return this.init();
    };
    $.pseudositer.defaultOptions = {
      optionOne: 'value',
      optionTwo: 'value'
    };
    $.fn.pseudositer = function(options) {
      return $.each(this, function(i, el) {
        var $el;
        $el = $(el);
        if (!$el.data('pseudositer')) {
          return $el.data('pseudositer', new $.pseudositer(el, options));
        }
      });
    };
    return;
  })(jQuery);

}).call(this);
