(function() {

  /*
  Pseudositer 0.0.4 content management for the lazy
  
  kudos to coffee-plate https://github.com/pthrasher/coffee-plate
  
  To use pseudositer, call the plugin upon an HTML element with an argument for
  the path to your content directory.
  
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
  */

  (function($) {
    /*
      # Utility functions
    */
    var getCurrentFragment, getCurrentPath, getFragmentFromUrl, getIndexTrail, getSuffix, loadImage, loadText, log;
    log = function(obj) {
      if (typeof console !== "undefined" && console !== null) {
        if (console.log != null) console.log(obj);
      }
      return;
    };
    loadImage = function(pathToImage) {
      log("loadImage( " + pathToImage + " )");
      return $.when($('<a />').attr('href', pathToImage).append($('<img />').attr('src', pathToImage)));
    };
    loadText = function(pathToText) {
      var dfd;
      log("loadText( " + pathToText + " )");
      dfd = new $.Deferred();
      $.get(pathToText).done(function(responseText) {
        return dfd.resolve($('<div />').text(responseText));
      }).fail(function(failObj) {
        return dfd.reject(failObj);
      });
      return dfd.promise();
    };
    getCurrentPath = function() {
      var path;
      return path = document.location.pathname;
    };
    getCurrentFragment = function() {
      var fragment;
      return fragment = document.location.hash.substr(1);
    };
    getIndexTrail = function(path) {
      var ary, i, trail, _ref;
      ary = path.split('/');
      trail = ['/'];
      for (i = 1, _ref = ary.length - 1; 1 <= _ref ? i < _ref : i > _ref; 1 <= _ref ? i++ : i--) {
        trail.push(ary.slice(0, i + 1 || 9e9).join('/') + '/');
      }
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
      var getAjaxPath, getIndexClassForLevel, load, loadContent, loadIndex, showContent, showIndices, unfold, update;
      var _this = this;
      this.el = el;
      this.$el = $(el);
      this.$el.data("pseudositer", this);
      this.pathIndices = {};
      this.cachedContent = {};
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
        if ($('.' + _this.options.contentClass).length === 0) {
          _this.$content = $('<div>').addClass(_this.options.contentClass);
          _this.$el.append(_this.$content);
        } else {
          _this.$content = $('.' + _this.options.contentClass);
        }
        $(window).bind('hashchange', update);
        update();
        return _this;
      };
      /*
          # Public methods
      */
      this.destroy = function() {
        _this.$el.empty();
        $(window).unbind('hashchange', update);
        return _this;
      };
      /*
          # Private methods.
      */
      getIndexClassForLevel = function(level) {
        return _this.options.indexClass + '-' + level;
      };
      getAjaxPath = function(path) {
        return _this.realPath + path.substr(1);
      };
      update = function() {
        var path, progress;
        log("update( )");
        path = getCurrentFragment();
        if (path === '') {
          document.location.hash = '/';
          return;
        }
        if (_this.cachedContent[path] != null) {
          showIndices(path);
          showContent(_this.cachedContent[path]);
          _this.$el.triggerHandler(_this.options.loadedEvent);
        } else {
          _this.$el.triggerHandler(_this.options.loadingEvent);
          progress = new $.Deferred();
          if (_this.options.recursion === true) {
            unfold(path).done(function(unfoldedPath) {
              return load(unfoldedPath).done(function() {
                return progress.resolve(unfoldedPath);
              }).fail(function(failObj) {
                return progress.reject(failObj);
              });
            }).fail(function(failObj) {
              return progress.reject(failObj);
            });
          } else {
            load(path).done(function() {
              return progress.resolve(path);
            }).fail(function(failObj) {
              return progress.reject(failObj);
            });
          }
          setTimeout((function() {
            return progress.reject("Timeout after " + _this.options.timeout + " ms");
          }), _this.options.timeout);
          progress.done(function(loadedPath) {
            if (path === loadedPath) {
              return update();
            } else {
              return document.location.hash = loadedPath;
            }
          }).fail(function(errObj) {
            return log(errObj);
          });
        }
        return _this;
      };
      load = function(unfoldedPath) {
        var contentPromise, dfd, indexPromise, trail, trails, _i, _len, _ref;
        log("load( " + unfoldedPath + " )");
        contentPromise = loadContent(unfoldedPath);
        dfd = new $.Deferred().resolve().pipe(function() {
          return contentPromise;
        });
        trails = getIndexTrail(unfoldedPath);
        _ref = trails.slice(0, (trails.length - 1) + 1 || 9e9);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          trail = _ref[_i];
          indexPromise = loadIndex(trail);
          dfd = dfd.pipe(function() {
            return indexPromise;
          });
        }
        return dfd.promise();
      };
      unfold = function(path, dfd) {
        if (dfd == null) dfd = new $.Deferred();
        log("unfold( " + path + ", " + dfd + " )");
        if (getSuffix(path) != null) {
          dfd.resolve(path);
        } else {
          $.when(loadIndex(path)).done(function() {
            var $links;
            $links = _this.pathIndices[path];
            if ($links.length === 0) {
              return dfd.reject("" + path + " has no content");
            } else {
              return unfold($links.first().attr('href').substr(1), dfd);
            }
          }).fail(function(failObj) {
            return dfd.reject(failObj);
          });
        }
        return dfd.promise();
      };
      loadIndex = function(indexPath) {
        var dfd;
        log("loadIndex( " + indexPath + " )");
        dfd = new $.Deferred();
        if (_this.pathIndices[indexPath] != null) {
          dfd.resolve();
        } else {
          $.get(getAjaxPath(indexPath), function(responseText) {
            var $links;
            $links = $(responseText).find(_this.options.linkSelector).attr('href', function(idx, oldValue) {
              if (oldValue.charAt(0) === '/') {
                return '#' + oldValue;
              } else {
                return '#' + indexPath + oldValue;
              }
            });
            return _this.pathIndices[indexPath] = $links;
          }).done(function() {
            return dfd.resolve();
          }).fail(function() {
            return dfd.reject("Could not load index page for " + indexPath);
          });
        }
        return dfd.promise();
      };
      loadContent = function(pathToContent) {
        var dfd, suffix;
        log("loadContent( " + pathToContent + " )");
        dfd = new $.Deferred();
        suffix = getSuffix(pathToContent);
        if (_this.options.map[suffix] != null) {
          _this.options.map[suffix](getAjaxPath(pathToContent)).done(function($content) {
            _this.cachedContent[pathToContent] = $content;
            return dfd.resolve();
          }).fail(function(failObj) {
            return dfd.reject(failObj);
          });
        } else {
          dfd.reject("No handler for content type " + suffix);
        }
        return dfd.promise();
      };
      showIndices = function(path) {
        var $index, level, levelClass, prevPath, trail, trails, _ref;
        log("showIndices( " + path + " )");
        trails = getIndexTrail(path);
        $('.' + _this.options.indexClass).addClass(_this.options.staleClass);
        for (level = 0, _ref = trails.length; 0 <= _ref ? level < _ref : level > _ref; 0 <= _ref ? level++ : level--) {
          trail = trails[level];
          levelClass = getIndexClassForLevel(level);
          $index = $('.' + levelClass);
          if ($index.length === 0) {
            $index = $('<div />').addClass(_this.options.indexClass + ' ' + levelClass).data('pseudositer', {});
            _this.$el.append($index);
          }
          prevPath = $index.data('pseudositer').path;
          if (trail !== prevPath) {
            $index.empty().data('pseudositer', {
              path: trail
            }).append(_this.pathIndices[trail]);
          }
          $index.removeClass(_this.options.staleClass);
        }
        $('.' + _this.options.indexClass + '.' + _this.options.staleClass).remove();
        return _this;
      };
      showContent = function($content) {
        log("showContent( " + $content + " )");
        $(_this.$content).empty().append($content);
        return _this;
      };
      return this.init();
    };
    $.pseudositer.defaultOptions = {
      contentClass: 'pseudositer-content',
      staleClass: 'pseudositer-stale',
      indexClass: 'pseudositer-index',
      linkSelector: 'a:not([href^="?"],[href^="/"])',
      loadingEvent: 'loading.pseudositer',
      loadedEvent: 'loaded.pseudositer',
      timeout: 1000,
      recursion: true,
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
