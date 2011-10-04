(function() {

  /*
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
  */

  (function($) {
    /*
      # Utility functions
    */
    var getCurrentFragment, getCurrentPath, getFragmentFromUrl, getSuffix, getTrails, loadImage, loadText, log;
    log = function(obj) {
      if (typeof console !== "undefined" && console !== null) {
        if (console.log != null) console.log(obj);
      }
      return;
    };
    loadImage = function(pathToImage) {
      return new $.Deferred().resolve($('a').attr('href', pathToImage.append($('img').attr('src', pathToImage.promise()))));
    };
    loadText = function(pathToText) {
      var dfd;
      return dfd = new $.Deferred(function() {
        var _this = this;
        return $.get(pathToText, function(responseText) {
          return dfd.resolve($('div').text(responseText));
        });
      });
    };
    getCurrentPath = function() {
      var path;
      return path = document.location.pathname;
    };
    getCurrentFragment = function() {
      var fragment;
      return fragment = document.location.hash.substr(1);
    };
    getTrails = function(path) {
      var ary, i, trail, _ref;
      log(path);
      ary = path.split('/');
      trail = ['/'];
      for (i = 1, _ref = ary.length - 1; 1 <= _ref ? i < _ref : i > _ref; 1 <= _ref ? i++ : i--) {
        trail.push('/' + ary.slice(0, i + 1 || 9e9).join('/') + '/');
      }
      if (ary[ary.length - 1] !== '') trail.push('/' + ary.join('/'));
      return trail;
    };
    getFragmentFromUrl = function(url) {
      var loc;
      loc = url.indexOf('#');
      if (loc > -1) {
        return url.substr(loc + 1);
      } else {
        return null;
      }
    };
    getSuffix = function(path) {
      var fileName, splitByDot, splitBySlash;
      splitBySlash = path.split('/');
      fileName = splitBySlash[splitBySlash.length - 1];
      splitByDot = fileName.split('.');
      if (splitByDot.length > 1) {
        return splitByDot[splitByDot.length - 1].toLowerCase();
      } else {
        return null;
      }
    };
    /*
      # Plugin code
    */
    $.pseudositer = function(el, hiddenPath, options) {
      var getAjaxPath, getIndexClassForLevel, hideLoading, load, loadContent, loadIndex, showContent, showIndices, showLoading, unfold, update;
      var _this = this;
      this.el = el;
      this.$el = $(el);
      this.destroyed = false;
      this.$el.data("pseudositer", this);
      this.pathIndices = {};
      this.cachedStates = {};
      this.init = function() {
        var split;
        _this.options = $.extend({}, $.pseudositer.defaultOptions, options);
        _this.visiblePath = getCurrentPath();
        hiddenPath = hiddenPath.charAt(hiddenPath.length - 1) === '/' ? hiddenPath : "" + hiddenPath + "/";
        if (hiddenPath.charAt(0) === '/') {
          _this.realPath = hiddenPath;
        } else {
          if (getSuffix(_this.visiblePath) != null) {
            split = _this.visiblePath.split('/');
            _this.realPath = split.slice(0, (split.length - 1)).join('/') + '/' + hiddenPath;
          } else {
            if (_this.visiblePath.charAt(_this.visiblePath.length - 1) === '/') {
              _this.realPath = _this.visiblePath + hiddenPath;
            } else {
              _this.realPath = _this.visiblePath + '/' + hiddenPath;
            }
          }
        }
        if ($('.' + _this.options.loadingClass).length === 0) {
          _this.$loading = $('<div>').addClass(_this.options.loadingClass);
          _this.$el.append(_this.$loading);
        } else {
          _this.$loading = $(_this.options.loadingClass);
        }
        hideLoading();
        _this.$loading.hide();
        if ($('.' + _this.options.contentClass).length === 0) {
          _this.$content = $('<div>').addClass(_this.options.contentClass);
          _this.$el.append(_this.$content);
        } else {
          _this.$content = $('.' + _this.options.contentClass);
        }
        History.Adapter.bind(window, 'statechange', function() {
          if (_this.destroyed === false) return update();
        });
        update();
        return _this;
      };
      /*
          # Public methods
      */
      this.destroy = function() {
        _this.destroyed = true;
        _this.$el.empty();
        return _this;
      };
      /*
          # Private methods.
      */
      getIndexClassForLevel = function(level) {
        return _this.options.indexClass + '-' + level;
      };
      getAjaxPath = function(fragment) {
        return _this.realPath + fragment.substr(1);
      };
      showLoading = function() {
        var dfd;
        dfd = new $.Deferred();
        _this.$loading.show('fast', function() {
          return dfd.resolve();
        });
        return dfd.promise();
      };
      hideLoading = function() {
        var dfd;
        dfd = new $.Deferred();
        _this.$loading.hide('fast', function() {
          return dfd.resolve();
        });
        return dfd.promise();
      };
      update = function() {
        var dfd, fragmentPath, state;
        state = History.getState();
        fragmentPath = getFragmentFromUrl(state.url);
        if (fragmentPath === null || fragmentPath === '') fragmentPath = '/';
        log("fragmentPath : " + fragmentPath);
        if (_this.cachedStates[fragmentPath] != null) {
          state = _this.cachedStates[fragmentPath];
        } else {
          if (state.data.pseudositer != null) {
            _this.cachedStates[fragmentPath] = state;
          }
        }
        if (state.data.pseudositer != null) {
          log("state.data:");
          log(state.data);
          showIndices(fragmentPath);
          showContent(state.data.pseudositer.$content);
        } else {
          showLoading();
          dfd = new $.Deferred();
          $.when(load(fragmentPath)).done(function(newState) {
            return dfd.resolve(newState);
          }).fail(function(errObj) {
            return dfd.reject(errObj);
          });
          setTimeout((function() {
            return dfd.reject("Timeout after " + _this.options.timeout + " ms");
          }), _this.options.timeout);
          $.when(dfd).done(function(newState) {
            return History.replaceState(newState);
          }).fail(function(errObj) {
            return log(errObj);
          }).always(function() {
            hideLoading();
            return _this.$el.triggerHandler(_this.options.alwaysEvent);
          });
        }
        return _this;
      };
      load = function(path) {
        var level, trail, trails, trailsLoaded, trailsToLoad, unfolded, _ref;
        trails = getTrails(path);
        trailsToLoad = [];
        for (level = 0, _ref = trails.length; 0 <= _ref ? level < _ref : level > _ref; 0 <= _ref ? level++ : level--) {
          trail = trails[level];
          if (_this.pathIndices[trail] == null) {
            trailsToLoad.push(loadIndex(trail));
          }
        }
        trailsLoaded = $.when(trailsToLoad);
        unfolded = $.Deferred();
        log("pre-unfolded path: " + path);
        $.when(unfold(path)).done(function(unfoldedPath) {
          log("unfolded path: " + unfoldedPath);
          return loadContent(unfoldedPath).done(function($content) {
            var newState;
            newState = History.createStateObject({
              pseudositer: {
                $content: $content
              }
            }, null, unfoldedPath);
            return unfolded.resolve(newState);
          }).fail(function(failObj) {
            return unfolded.reject(failObj);
          });
        });
        return $.when(unfolded, trailsLoaded);
      };
      unfold = function(path, dfd) {
        if (dfd == null) dfd = new $.Deferred();
        if (path.charAt(0) === '#') path = path.substr(1);
        if (getSuffix(path) != null) {
          dfd.resolve(path);
        } else {
          $.when(loadIndex(path)).done(function($links) {
            if ($links.length === 0) {
              return dfd.reject("" + path + " has no content");
            } else {
              log("unfold " + ($links.first().attr('href')));
              return unfold($links.first().attr('href'), dfd);
            }
          }).fail(function(failObj) {
            return dfd.reject(failObj);
          });
        }
        return dfd.promise();
      };
      loadIndex = function(indexPath) {
        var dfd;
        dfd = new $.Deferred();
        if (_this.pathIndices[indexPath] != null) {
          dfd.resolve(_this.pathIndices[indexPath]);
        } else {
          $.get(getAjaxPath(indexPath), function(responseText) {
            var $links;
            $links = $(responseText).find(_this.options.linkSelector).attr('href', function(idx, oldValue) {
              return '#' + (oldValue.charAt(0) === '/' ? oldValue : indexPath + oldValue);
            });
            log($links);
            return _this.pathIndices[indexPath] = $links;
          }).done(function() {
            return dfd.resolve(_this.pathIndices[indexPath]);
          }).fail(function() {
            return dfd.reject("Could not load index page for " + indexPath);
          });
        }
        return dfd.promise();
      };
      loadContent = function(pathToContent) {
        var dfd, suffix;
        suffix = getSuffix(pathToContent);
        log("suffix " + suffix);
        if (_this.options.map[suffix] != null) {
          return _this.options.map[suffix](getAjaxPath(pathToContent));
        } else {
          return dfd = new $.Deferred().reject().promise();
        }
      };
      showIndices = function(path) {
        var $index, level, levelClass, prevPath, trail, trails, _ref;
        trails = getTrails(path);
        $('.' + _this.options.indexClass).addClass(_this.options.staleClass);
        for (level = 0, _ref = trails.length; 0 <= _ref ? level < _ref : level > _ref; 0 <= _ref ? level++ : level--) {
          trail = trails[level];
          levelClass = getIndexClassForLevel(level);
          $index = $('.' + levelClass);
          log("" + levelClass + ": levelClass");
          if ($index.length === 0) {
            $index = $('div').addClass(_this.options.indexClass + ' ' + levelClass.data('pseudositer', {}));
            _this.$el.append($index);
          }
          prevPath = $index.data('pseudositer').path;
          if (trail !== prevPath) {
            $index.empty();
            $index.data('pseudositer', {
              path: trail
            });
            $index.append(_this.pathIndices[trail]);
          }
          $index.removeClass(_this.options.staleClass);
        }
        $('.' + _this.options.indexClass + '.' + _this.options.staleClass).remove();
        return _this;
      };
      showContent = function($content) {
        log("showContent");
        log(_this.$content);
        $(_this.$content).empty().append($content);
        return _this;
      };
      return this.init();
    };
    $.pseudositer.defaultOptions = {
      loadingClass: 'pseudositer-load',
      contentClass: 'pseudositer-content',
      staleClass: 'pseudositer-stale',
      indexClass: 'pseudositer-index',
      linkSelector: 'a:not([href^="?"],[href^="/"])',
      alwaysEvent: 'pseudositer-always',
      timeout: 1000,
      map: {
        png: loadImage,
        gif: loadImage,
        jpg: loadImage,
        jpeg: loadImage,
        txt: loadText,
        html: loadText
      }
    };
    $.fn.pseudositer = function(hiddenPath, options) {
      return $.each(this, function(i, el) {
        var $el;
        $el = $(el);
        if (!$el.data('pseudositer')) {
          return $el.data('pseudositer', new $.pseudositer(el, hiddenPath, options));
        }
      });
    };
    return;
  })(jQuery);

}).call(this);
