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

  var __slice = Array.prototype.slice;

  (function($) {
    /*
      #
      # Static constant events
      #
    */
    var contentClass, createIndex, destroyIndex, errorClass, events, getClassForPath, getContentContainer, getCurrentFragment, getCurrentPath, getIndexClassForLevel, getIndexContainer, getIndexTrail, getPathDepth, getSuffix, hideContent, hideError, hideLoadingNotice, indexClass, indexContainerClass, isPathToFile, linkClass, loadHtml, loadImage, loadText, loadingClass, log, showContent, showError, showLoadingNotice, staleClass;
    events = ['update', 'startLoading', 'failedLoading', 'doneLoading', 'alwaysLoading', 'destroyIndex', 'createIndex', 'loadImage', 'loadText', 'loadHtml', 'loadDefault', 'hideContent', 'showContent', 'showError', 'destroy'];
    /*
      #
      # Static class names for default handlers
      #
    */
    contentClass = 'pseudositer-content';
    staleClass = 'pseudositer-stale';
    indexClass = 'pseudositer-index';
    indexContainerClass = 'pseudositer-index-container';
    loadingClass = 'pseudositer-loading';
    errorClass = 'pseudositer-error';
    linkClass = 'pseudositer-link';
    /*
      #
      # Static functions
      #
    */
    log = function(obj) {
      if ((typeof console !== "undefined" && console !== null ? console.log : void 0) != null) {
        console.log(obj);
      }
      return;
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
    getPathDepth = function(path) {
      return path.split('/').length - 2;
    };
    isPathToFile = function(path) {
      log("isPathToFile( " + path + " )");
      if (path.charAt(path.length - 1) !== '/') {
        return true;
      } else {
        return false;
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
    getContentContainer = function($pseudositer) {
      var $container;
      $container = $('.' + contentClass);
      if ($container.length === 0) {
        $container = $('<div />').addClass(contentClass).appendTo($pseudositer);
      }
      return $container;
    };
    getIndexContainer = function($pseudositer) {
      var $container;
      $container = $('.' + indexContainerClass);
      if ($container.length === 0) {
        $container = $('<div />').addClass(indexContainerClass).prependTo($pseudositer);
      }
      return $container;
    };
    getIndexClassForLevel = function(level) {
      return indexClass + '-' + level;
    };
    getClassForPath = function(path) {
      return path.replace(/[^A-Za-z0-9]/g, '-');
    };
    /*
      #
      # Default handlers -- these are all called with the pseudositer object
      # as this.
      #
    */
    showLoadingNotice = function(spawningPath) {
      var $loadingNotice, classForPath;
      log("showLoadingNotice( " + spawningPath + " )");
      classForPath = getClassForPath(spawningPath);
      $loadingNotice = $('<div />').hide().text("Loading " + spawningPath + "...").addClass("" + loadingClass + " " + classForPath).appendTo(this).fadeIn('fast');
      return;
    };
    hideLoadingNotice = function(spawningPath) {
      var $elem, classForPath;
      log("hideLoadingNotice( " + spawningPath + " )");
      if (spawningPath != null) {
        classForPath = getClassForPath(spawningPath);
        $elem = $("." + loadingClass + "." + classForPath);
      } else {
        $elem = $("." + loadingClass);
      }
      $elem.fadeOut('fast', function() {
        return $elem.remove();
      });
      return;
    };
    destroyIndex = function(dfd, aboveIndexLevel) {
      var destroyed;
      log("destroyIndex( " + dfd + ", " + aboveIndexLevel + " )");
      destroyed = new $.Deferred().resolve();
      $('.' + indexClass).each(function(idx, elem) {
        var $index, idxDestroy;
        $index = $(elem);
        if ($index.data('pseudositer').level > aboveIndexLevel) {
          idxDestroy = new $.Deferred(function(idxDestroy) {
            return $index.fadeOut('slow', function() {
              $index.remove();
              return idxDestroy.resolve();
            });
          });
          return destroyed = destroyed.pipe(idxDestroy);
        }
      });
      destroyed.done(function() {
        return dfd.resolve();
      });
      return;
    };
    createIndex = function(dfd, path, $links) {
      var $index, indexLevel, levelClass, prevPath;
      log("createIndex( " + dfd + ", " + path + ", " + $links + " )");
      indexLevel = path.split('/').length - 2;
      levelClass = getIndexClassForLevel(indexLevel);
      $index = $('.' + levelClass);
      if ($index.length === 0) {
        $index = $('<div />').addClass(indexClass + ' ' + levelClass).data('pseudositer', {}).hide();
        getIndexContainer(this).append($index);
      }
      prevPath = $index.data('pseudositer').path;
      if (path === prevPath) {
        dfd.resolve();
      } else {
        $index.fadeOut('slow', function() {
          return $index.empty().data('pseudositer', {
            path: path,
            level: indexLevel
          }).append($links).fadeIn('slow', function() {
            return dfd.resolve();
          });
        });
      }
      return;
    };
    loadImage = function(dfd, pathToImage) {
      var $img, $tmp;
      log("loadImage( " + dfd + ", " + pathToImage + " )");
      $tmp = $('<div />').css({
        height: '0px',
        width: '0px'
      }).appendTo($('body'));
      $img = $('<a />').attr('href', pathToImage).append($('<img />').attr('src', pathToImage).bind('load', function() {
        dfd.resolve($img);
        return $tmp.remove();
      }));
      return;
    };
    loadText = function(dfd, pathToText) {
      log("loadText( " + dfd + ", " + pathToText + " )");
      $.get(pathToText).done(function(responseText) {
        return dfd.resolve($('<div />').append($('<pre />').text(responseText)));
      }).fail(function(errObj) {
        return dfd.reject(errObj.statusText);
      });
      return;
    };
    loadHtml = function(dfd, pathToHtml) {
      log("loadHtml( " + dfd + ", " + pathToHtml + " )");
      $.get(pathToHtml).done(function(responseText) {
        return dfd.resolve($(responseText));
      }).fail(function(errObj) {
        return dfd.reject(errObj.statusText);
      });
      return;
    };
    hideContent = function(dfd) {
      var $content;
      log("hideContent( " + dfd + " )");
      $content = getContentContainer(this).children();
      if ($content.length === 0) {
        dfd.resolve();
      } else {
        $content.fadeOut('slow', function() {
          $content.detach();
          return dfd.resolve();
        });
      }
      return;
    };
    showContent = function(dfd, $elem) {
      var $container;
      log("showContent( " + dfd + ", " + $elem + " )");
      $container = getContentContainer(this);
      $elem.hide().appendTo($container).fadeIn('slow', function() {
        return dfd.resolve();
      });
      return;
    };
    showError = function(errObj) {
      var $error;
      log("showError( " + errObj + " )");
      log(errObj);
      $error = $('.' + errorClass);
      if ($error.length === 0) {
        $error = $('<div />').addClass(errorClass).appendTo(getContentContainer(this));
      }
      $error.text(errObj.toString()).fadeIn('fast');
      return;
    };
    hideError = function() {
      var $error;
      log("hideError( )");
      $error = $('.' + errorClass);
      $error.fadeOut('fast', function() {
        return $error.text('');
      });
      return;
    };
    /*
      #
      # Plugin object
      #
    */
    $.pseudositer = function(el, hiddenPath, options, map) {
      var getAjaxPath, load, loadContent, loadIndex, showIndices, trigger, unfold, update;
      var _this = this;
      this.$el = $(el);
      this.$el.data("pseudositer", this);
      this.cache = {};
      this.init = function() {
        var event, handler, split, _i, _j, _len, _len2, _ref;
        _this.options = $.extend({}, $.pseudositer.defaultOptions, options);
        log(_this.options);
        _this.map = $.extend({}, $.pseudositer.defaultMap, map);
        _this.visiblePath = getCurrentPath();
        if (!hiddenPath.charAt(hiddenPath.length - 1)) {
          hiddenPath = "" + hiddenPath + "/";
        }
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
        $(window).bind('hashchange', update);
        for (_i = 0, _len = events.length; _i < _len; _i++) {
          event = events[_i];
          _ref = _this.options[event];
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            handler = _ref[_j];
            _this.$el.bind("" + event + ".pseudositer", {
              handler: handler
            }, function() {
              var args, evt;
              evt = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
              evt.data.handler.apply(_this.$el, args);
              return false;
            });
          }
        }
        update();
        return _this;
      };
      /*
          #
          # Public methods
          #
      */
      this.destroy = function() {
        $(window).unbind('hashchange', update);
        trigger('destroy');
        _this.$el.empty().unbind('.pseudositer');
        _this.$el.removeData('pseudositer');
        document.location.hash = "";
        return _this;
      };
      /*
          #
          # Private methods.
          #
      */
      trigger = function() {
        var args, eventName;
        eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        log("trigger( " + eventName + ", " + args + " )");
        _this.$el.triggerHandler("" + eventName + ".pseudositer", args);
        return _this;
      };
      getAjaxPath = function(path) {
        log("getAjaxPath( " + path + " )");
        return _this.realPath + path.substr(1);
      };
      update = function() {
        var $content, contentHidden, contentShown, path;
        log("update( )");
        path = getCurrentFragment();
        if (path === '') {
          document.location.hash = '/';
          return;
        }
        if (_this.cache[path] != null) {
          showIndices(path);
          contentHidden = new $.Deferred();
          trigger('hideContent', contentHidden);
          if (isPathToFile(path)) {
            $content = _this.cache[path];
            contentShown = new $.Deferred();
            contentHidden.done(function() {
              return trigger('showContent', contentShown, $content);
            }).fail(function(errObj) {
              return trigger('showError', errObj);
            });
          }
        } else {
          load(path).done(function(loadedPath) {
            if (path === loadedPath) {
              return update();
            } else {
              return document.location.hash = loadedPath;
            }
          }).fail(function(errObj) {
            return trigger('showError', errObj);
          });
        }
        return _this;
      };
      load = function(spawningPath) {
        var pathDfd, progress;
        log("load( " + spawningPath + " )");
        trigger('startLoading', spawningPath);
        log("recursion: " + _this.options.recursion);
        if (_this.options.recursion === true) {
          pathDfd = unfold(spawningPath);
        } else {
          pathDfd = new $.Deferred().resolve(spawningPath);
        }
        progress = new $.Deferred();
        pathDfd.done(function(path) {
          var contentPromise, dfd, indexPromise, trail, trails, _i, _len, _ref;
          dfd = new $.Deferred().resolve();
          if (isPathToFile(path)) {
            contentPromise = loadContent(path);
            dfd = dfd.pipe(function() {
              return contentPromise;
            });
          }
          trails = getIndexTrail(path);
          _ref = trails.slice(0, (trails.length - 1) + 1 || 9e9);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            trail = _ref[_i];
            indexPromise = loadIndex(trail);
            dfd = dfd.pipe(function() {
              return indexPromise;
            });
          }
          return dfd.done(function() {
            return progress.resolve(path);
          }).fail(function(errObj) {
            return progress.reject(errObj);
          });
        }).fail(function(errObj) {
          return progress.reject(errObj);
        });
        setTimeout((function() {
          return progress.reject("Timeout after " + _this.options.timeout + " ms");
        }), _this.options.timeout);
        progress.done(function(loadedPath) {
          return trigger('doneLoading', spawningPath, loadedPath);
        }).fail(function(errObj) {
          return trigger('failedLoading', spawningPath);
        }).always(function() {
          return trigger('alwaysLoading', spawningPath);
        });
        return progress.promise();
      };
      unfold = function(path, dfd) {
        if (dfd == null) dfd = new $.Deferred();
        log("unfold( " + path + ", " + dfd + " )");
        if (getSuffix(path) != null) {
          dfd.resolve(path);
        } else {
          loadIndex(path).done(function() {
            var $links;
            $links = _this.cache[path];
            if ($links.length === 0) {
              return dfd.reject("" + path + " has no content");
            } else {
              return unfold($links.first().attr('href').substr(1), dfd);
            }
          }).fail(function(errObj) {
            return dfd.reject(errObj);
          });
        }
        return dfd.promise();
      };
      loadIndex = function(indexPath) {
        var dfd;
        log("loadIndex( " + indexPath + " )");
        dfd = new $.Deferred();
        if (_this.cache[indexPath] != null) {
          dfd.resolve();
        } else {
          $.get(getAjaxPath(indexPath), function(responseText) {
            var $links;
            $links = $(responseText).find(_this.options.linkSelector).addClass(linkClass).attr('href', function(idx, oldValue) {
              if (oldValue.charAt(0) === '/') {
                return '#' + oldValue;
              } else {
                return '#' + indexPath + oldValue;
              }
            });
            return _this.cache[indexPath] = $links;
          }).done(function() {
            return dfd.resolve();
          }).fail(function() {
            return dfd.reject("Could not load index page for " + indexPath);
          });
        }
        return dfd.promise();
      };
      loadContent = function(pathToContent) {
        var dfd, handler, suffix;
        log("loadContent( " + pathToContent + " )");
        dfd = new $.Deferred();
        suffix = getSuffix(pathToContent);
        handler = _this.map[suffix] != null ? _this.map[suffix] : _this.map[''];
        trigger(handler, dfd, getAjaxPath(pathToContent));
        dfd.done(function($content) {
          _this.cache[pathToContent] = $content;
          return dfd.resolve();
        }).fail(function(errObj) {
          return dfd.reject(errObj);
        });
        return dfd.promise();
      };
      showIndices = function(path) {
        var $links, dfd, idxDfds, trail, trails, _i, _len;
        log("showIndices( " + path + " )");
        dfd = new $.Deferred();
        trigger('destroyIndex', dfd, getPathDepth(path));
        trails = getIndexTrail(path);
        idxDfds = [dfd];
        for (_i = 0, _len = trails.length; _i < _len; _i++) {
          trail = trails[_i];
          $links = _this.cache[trail];
          idxDfds.push(idxDfds[idxDfds.length - 1].pipe(function() {
            return trigger('createIndex', new $.Deferred(), trail, $links);
          }));
        }
        return idxDfds[idxDfds.length - 1].promise();
      };
      return this.init();
    };
    $.pseudositer.defaultOptions = {
      linkSelector: 'a:not([href^="?"],[href^="/"],[href^="."])',
      update: [hideError],
      startLoading: [showLoadingNotice],
      failedLoading: [],
      doneLoading: [],
      alwaysLoading: [hideLoadingNotice],
      destroyIndex: [destroyIndex],
      createIndex: [createIndex],
      loadImage: [loadImage],
      loadText: [loadText],
      loadHtml: [loadHtml],
      loadDefault: [loadText],
      hideContent: [hideContent],
      showContent: [showContent],
      showError: [showError],
      destroy: [hideLoadingNotice, hideError],
      timeout: 10000,
      recursion: true
    };
    $.pseudositer.defaultMap = {
      png: 'loadImage',
      gif: 'loadImage',
      jpg: 'loadImage',
      jpeg: 'loadImage',
      txt: 'loadText',
      html: 'loadHtml',
      '': 'loadDefault'
    };
    $.fn.pseudositer = function(hiddenPath, options, map) {
      if (map == null) map = {};
      if ((options != null ? options.map : void 0) != null) {
        $.extend(map, options.map);
      }
      return $.each(this, function(i, el) {
        var $el;
        $el = $(el);
        if (!$el.data('pseudositer')) {
          return $el.data('pseudositer', new $.pseudositer(el, hiddenPath, options, map));
        }
      });
    };
    return;
  })(jQuery);

}).call(this);
