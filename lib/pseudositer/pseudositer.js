(function() {

  /*
  # Pseudositer 0.0.4 content management for the lazy
  #
  # kudos to coffee-plate https://github.com/pthrasher/coffee-plate
  */

  (function($) {
    $.pseudositer = function(el, options) {
      var displayContent, displayDirectory, handleStateChange, hideLoadingNotice, loadDirectory, loadNewState, showLoadingNotice, updateState;
      var _this = this;
      this.el = el;
      this.$el = $(el);
      this.$el.data("pseudositer", this);
      this.init = function(rootUrl) {
        _this.options = $.extend({}, $.pseudositer.defaultOptions, options);
        if ($(_this.options.loadingClass).length === 0) {
          _this.$loading = $('<div>').addClass(_this.options.loadingClass);
          _this.$el.append(_this.$loading);
        } else {
          _this.$loading = $(_this.options.loadingClass);
        }
        _this.$loading.hide();
        History.Adapter.bind(window, 'statechange', function() {
          var curState, lastState, savedStates;
          savedStates = History.savedStates;
          lastState = savedStates[savedStates.length - 2];
          curState = savedStates[savedStates.length - 1];
          if (lastState === null) {
            return updateState(curState);
          } else {
            return handleStateChange(lastState, curState);
          }
        });
        updateState(History.getState());
        return _this;
      };
      /*
          # Public methods
      */
      this.destroy = function() {
        _this.$el.empty();
        return _this;
      };
      /*
          # Private methods.
      */
      showLoadingNotice = function() {
        _this.$loading.show();
        return _this;
      };
      hideLoadingNotice = function() {
        _this.$loading.hide();
        return _this;
      };
      handleStateChange = function(oldState, newState) {
        console.log("" + oldState.cleanUrl + " to " + newState.cleanUrl);
        if (oldState.cleanUrl !== newState.cleanUrl) updateState(newState);
        return _this;
      };
      updateState = function(state) {
        return _this;
      };
      loadNewState = function(state) {
        return _this;
      };
      loadDirectory = function(directoryUrl) {
        return _this;
      };
      displayDirectory = function(level, links) {
        return _this;
      };
      displayContent = function(state) {
        return _this;
      };
      return this.init();
    };
    $.pseudositer.defaultOptions = {
      loadingClass: 'pseudositer-load'
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
