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
    var getPathArray, getPathWithoutFilename, getSuffix, getTrails, loadImage, loadText, log;
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
    getPathWithoutFilename = function() {
      var ary, path;
      path = location.pathname;
      if (getSuffix(path) != null) {
        ary = path.split('/');
        return ary.slice(0, (ary.length - 1)).join('/') + '/';
      } else {
        return path;
      }
    };
    getPathArray = function(url) {
      var split;
      split = url.split('#')[0].split('/');
      return split.slice(3, split.length);
    };
    getTrails = function(url) {
      var ary, i, trail, _ref;
      ary = getPathArray(url);
      trail = ['/'];
      for (i = 1, _ref = ary.length - 1; 1 <= _ref ? i < _ref : i > _ref; 1 <= _ref ? i++ : i--) {
        trail.push('/' + ary.slice(0, i + 1 || 9e9).join('/') + '/');
      }
      if (ary[ary.length - 1] !== '') trail.push('/' + ary.join('/'));
      return trail;
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
    $.pseudositer = function(el, rootPath, options) {
      var getAbsPath, getIndexClassForLevel, hideLoading, load, loadContent, loadIndex, showContent, showIndices, showLoading, unfold, update;
      var _this = this;
      this.el = el;
      this.$el = $(el);
      this.$el.data("pseudositer", this);
      this.pathIndices = {};
      this.cachedStates = {};
      this.init = function() {
        log("init with " + rootPath);
        _this.options = $.extend({}, $.pseudositer.defaultOptions, options);
        rootPath = rootPath.charAt(rootPath.length - 1) === '/' ? rootPath : "" + rootPath + "/";
        if (rootPath.charAt(0) === '/') {
          _this.rootPath = rootPath;
        } else {
          _this.rootPath = getPathWithoutFilename() + rootPath;
        }
        if ($(_this.options.loadingClass).length === 0) {
          _this.$loading = $('<div>').addClass(_this.options.loadingClass);
          _this.$el.append(_this.$loading);
        } else {
          _this.$loading = $(_this.options.loadingClass);
        }
        _this.$loading.hide();
        if ($(_this.options.contentClass).length === 0) {
          _this.$content = $('<div>').addClass(_this.options.contentClass);
          _this.$el.append(_this.$content);
        } else {
          _this.$content = $(_this.options.contentClass);
        }
        History.Adapter.bind(window, 'statechange', update);
        History.replaceState(null, null, _this.rootPath);
        return _this;
      };
      /*
          # Public methods
      */
      this.destroy = function() {
        _this.$el.empty();
        $(window).unbind('hashchange');
        $(window).unbind('popstate');
        return _this;
      };
      /*
          # Private methods.
      */
      getIndexClassForLevel = function(level) {
        return _this.options.indexClass + '-' + level;
      };
      getAbsPath = function(path) {
        if (path.charAt(0) === '/') {
          return _this.rootPath + path.substr(1);
        } else {
          return _this.rootPath + path;
        }
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
        var state;
        state = History.getState();
        log("state url: " + state.url);
        log("fresh url: " + (History.getState().url));
        if (_this.cachedStates[state.url] != null) {
          state = _this.cachedStates[state.url];
        } else {
          if (state.data.pseudositer != null) {
            _this.cachedStates[state.url] = state;
          }
        }
        if (state.data.pseudositer != null) {
          showIndices(state.url);
          showContent(state.data.pseudositer.$content);
        } else {
          showLoading();
          $.when(load(state)).done(function(newState) {
            return History.replaceState(newState);
          }).fail(function(errObj) {
            return log(errObj);
          }).always(function() {
            hideLoading();
            log("should have triggered " + _this.options.alwaysEvent + " on " + (_this.$el.attr('id')));
            return _this.$el.triggerHandler(_this.options.alwaysEvent);
          });
        }
        return _this;
      };
      load = function(state) {
        var dfd, level, path, trail, trails, url, _ref;
        dfd = new $.Deferred();
        url = state.url;
        trails = getTrails(url);
        for (level = 0, _ref = trails.length; 0 <= _ref ? level < _ref : level > _ref; 0 <= _ref ? level++ : level--) {
          trail = trails[level];
          if (_this.pathIndices[trail] == null) dfd = dfd.pipe(loadIndex(trail));
        }
        path = trails[trails.length - 1];
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
            log("newState " + newState);
            return dfd.resolve(newState);
          }).fail(function(failObj) {
            return dfd.reject(failObj);
          });
        });
        return dfd.promise();
      };
      unfold = function(path, dfd) {
        if (dfd == null) dfd = new $.Deferred();
        if (getSuffix(path) !== null) {
          dfd.resolve(path);
        } else {
          $.when(loadIndex(path)).done(function($links) {
            log("$links: " + ($links.toString()));
            if ($links.length === 0) {
              return dfd.reject("" + path + " has no content");
            } else {
              return unfold($links.first().attr('href'), dfd);
            }
          });
        }
        return dfd.promise();
      };
      loadIndex = function(path) {
        var dfd;
        dfd = new $.Deferred();
        if (_this.pathIndices[path] != null) {
          dfd.resolve(_this.pathIndices[path]);
        } else {
          $.when($.get(getAbsPath(path, function(responseText) {
            _this.pathIndices[path] = $(data).find(options.linkSelector);
            return dfd.resolve(_this.pathIndices([path]));
          })));
        }
        return dfd;
      };
      loadContent = function(pathToContent) {
        var dfd, suffix;
        suffix = getSuffix(pathToContent);
        if (_this.options.map[suffix] != null) {
          dfd = _this.options.map[suffix](getAbsPath(pathToContent));
          return dfd.promise();
        } else {
          log("No handler for file suffix " + suffix + ".");
          return dfd = new $.Deferred().reject().promise();
        }
      };
      showIndices = function(url) {
        var $index, level, levelClass, prevPath, trail, trails, _ref;
        trails = getTrails(url);
        $('.' + _this.options.indexClass).addClass(_this.options.staleClass);
        for (level = 0, _ref = trails.length; 0 <= _ref ? level < _ref : level > _ref; 0 <= _ref ? level++ : level--) {
          trail = trails[level];
          levelClass = getIndexClassForLevel(level);
          $index = $('.' + levelClass);
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
      map: {
        png: loadImage,
        gif: loadImage,
        jpg: loadImage,
        jpeg: loadImage,
        txt: loadText,
        html: loadText
      }
    };
    $.fn.pseudositer = function(rootPath, options) {
      return $.each(this, function(i, el) {
        var $el;
        $el = $(el);
        if (!$el.data('pseudositer')) {
          return $el.data('pseudositer', new $.pseudositer(el, rootPath, options));
        }
      });
    };
    return;
  })(jQuery);

}).call(this);
