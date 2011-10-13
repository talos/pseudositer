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
    var clipExtension, contentClass, createIndex, destroyIndex, download, errorClass, events, getClassForPath, getContentContainer, getCurrentFragment, getCurrentPath, getIndexClassForLevel, getIndexContainer, getIndexLevel, getIndexTrail, getPathDepth, getSuffix, hideContent, hideError, hideLoadingNotice, indexClass, indexContainerClass, isPathToFile, linkClass, loadHtml, loadImage, loadText, loadingClass, log, showContent, showError, showLoadingNotice, staleClass;
    events = ['startUpdate', 'doneUpdate', 'startLoading', 'failedLoading', 'doneLoading', 'alwaysLoading', 'destroyIndex', 'createIndex', 'loadImage', 'loadText', 'loadHtml', 'loadDefault', 'hideContent', 'showContent', 'showError', 'destroy'];
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
    getIndexLevel = function($elem) {
      var classes, klass, match, _i, _len;
      classes = $elem.attr('class').split(/\s+/);
      for (_i = 0, _len = classes.length; _i < _len; _i++) {
        klass = classes[_i];
        match = klass.match(new RegExp("" + indexClass + "-(\\d)"));
        if (match != null) return match[1];
      }
      throw "Could not find an index level in classes " + classes;
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
    clipExtension = function(path) {
      var fileNameAry, fileNameWithoutExtension, pathAry;
      if (isPathToFile(path)) {
        pathAry = path.split('/');
        fileNameAry = pathAry[pathAry.length - 1].split('.');
        fileNameWithoutExtension = fileNameAry.slice(0, (fileNameAry.length - 1)).join('.');
        pathAry = pathAry.slice(0, (pathAry.length - 1));
        pathAry.push(fileNameWithoutExtension);
        return pathAry.join('/');
      } else {
        return path;
      }
    };
    /*
      #
      # Default handlers -- these are all called with the pseudositer object
      # as this.
      #
    */
    showLoadingNotice = function(evt, spawningPath) {
      var $loadingNotice, classForPath;
      log("showLoadingNotice( " + spawningPath + " )");
      classForPath = getClassForPath(spawningPath);
      $loadingNotice = $('<div />').hide().text("Loading " + spawningPath + "...").addClass("" + loadingClass + " " + classForPath).appendTo(this).fadeIn('fast');
      return;
    };
    hideLoadingNotice = function(evt, spawningPath) {
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
    destroyIndex = function(evt, dfd, aboveIndexLevel) {
      var destroyed;
      log("destroyIndex( " + dfd + ", " + aboveIndexLevel + " )");
      destroyed = new $.Deferred().resolve();
      $('.' + indexClass).each(function(idx, elem) {
        var $index, idxDestroy;
        $index = $(elem);
        if (getIndexLevel($index) > aboveIndexLevel) {
          idxDestroy = new $.Deferred(function(idxDestroy) {
            return $index.fadeOut('slow', function() {
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
    createIndex = function(evt, dfd, path, $links) {
      var $index, indexLevel, levelClass, prevPath;
      log("createIndex( " + dfd + ", " + path + ", " + $links + " )");
      indexLevel = path.split('/').length - 2;
      levelClass = getIndexClassForLevel(indexLevel);
      $index = $('.' + levelClass);
      if ($index.length === 0) {
        $index = $('<div />').addClass(indexClass + ' ' + levelClass).hide();
        getIndexContainer(this).append($index);
      }
      if (!$index.data('pseudositer')) $index.data('pseudositer', {});
      prevPath = $index.data('pseudositer').path;
      if (path === prevPath) {
        dfd.resolve();
      } else {
        $index.fadeOut('slow', function() {
          return $index.empty().data('pseudositer', {
            path: path
          }).append($links).fadeIn('slow', function() {
            return dfd.resolve();
          });
        });
      }
      return;
    };
    loadImage = function(evt, dfd, pathToImage) {
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
    loadText = function(evt, dfd, pathToText) {
      log("loadText( " + dfd + ", " + pathToText + " )");
      $.get(pathToText).done(function(responseText) {
        return dfd.resolve($('<div />').append($('<pre />').text(responseText)));
      }).fail(function(errObj) {
        return dfd.reject(errObj.statusText);
      });
      return;
    };
    loadHtml = function(evt, dfd, pathToHtml) {
      log("loadHtml( " + dfd + ", " + pathToHtml + " )");
      $.get(pathToHtml).done(function(responseText) {
        return dfd.resolve($(responseText));
      }).fail(function(errObj) {
        return dfd.reject(errObj.statusText);
      });
      return;
    };
    download = function(evt, dfd, pathToFile) {
      log("download( " + dfd + ", " + pathToFile + " )");
      dfd.resolve($('<a />').text(pathToFile).attr('href', pathToFile));
      return;
    };
    hideContent = function(evt, dfd) {
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
    showContent = function(evt, dfd, $elem) {
      var $container;
      log("showContent( " + dfd + ", " + $elem + " )");
      $container = getContentContainer(this);
      $elem.hide().appendTo($container).fadeIn('slow', function() {
        return dfd.resolve();
      });
      return;
    };
    showError = function(evt, errObj) {
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
    hideError = function(evt) {
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
      var getAjaxPath, load, loadContent, loadIndex, redirectToFile, showIndices, trigger, update;
      var _this = this;
      this.$el = $(el);
      this.$el.data("pseudositer", this);
      this.cache = {};
      this.init = function() {
        var event, handler, split, _i, _j, _len, _len2, _ref;
        _this.options = $.extend({}, $.pseudositer.defaultOptions, options);
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
              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              evt = args[0];
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
      this.setRecursion = function(recursion) {
        log("setRecursion( " + recursion + " )");
        if ((recursion === true || recursion === false) && _this.options.recursion !== recursion) {
          _this.options.recursion = recursion;
          update();
        } else {
          throw 'new value for recursion must be true or false';
        }
        return _this;
      };
      this.destroy = function() {
        log("destroy( )");
        $(window).unbind('hashchange', update);
        _this.$el.empty();
        _this.$el.removeData('pseudositer');
        document.location.hash = "";
        trigger('destroy');
        _this.$el.unbind('.pseudositer');
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
        var loaded, path, updateDfd;
        log("update( )");
        path = getCurrentFragment();
        if (path === '') {
          document.location.hash = '/';
          return;
        }
        if (path.charAt(0) !== '/') {
          document.location.hash = "/" + path;
          return;
        }
        if (_this.options.recursion === true && isPathToFile(path) !== true) {
          redirectToFile(path);
          return;
        }
        trigger('startUpdate', path);
        updateDfd = new $.Deferred().done(function() {
          return trigger('doneUpdate');
        }).fail(function(failObj) {
          return trigger('showError', failObj);
        }).always(function() {
          return trigger('alwaysUpdate');
        });
        if (_this.cache[path] != null) {
          loaded = new $.Deferred().resolve();
        } else {
          loaded = load(path);
        }
        setTimeout((function() {
          return updateDfd.reject("Load timeout after " + _this.options.timeout + " ms");
        }), _this.options.timeout);
        loaded.fail(function(failObj) {
          return updateDfd.reject(failObj);
        }).done(function() {
          var contentHidden;
          showIndices(path);
          contentHidden = new $.Deferred().fail(function(failObj) {
            return updateDfd.reject(failObj);
          }).done(function() {
            var $content, contentShown;
            if (isPathToFile(path)) {
              $content = _this.cache[path];
              contentShown = new $.Deferred().done(function() {
                return updateDfd.resolve();
              }).fail(function(failObj) {
                return updateDfd.reject(failObj);
              });
              return trigger('showContent', contentShown, $content);
            } else {
              return updateDfd.resolve();
            }
          });
          return trigger('hideContent', contentHidden);
        });
        return _this;
      };
      load = function(path) {
        var contentPromise, dfd, indexPromise, progress, trail, trails, _i, _len, _ref;
        log("load( " + path + " )");
        trigger('startLoading', path);
        progress = new $.Deferred();
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
        dfd.done(function() {
          return progress.resolve();
        }).fail(function(errObj) {
          return progress.reject(errObj);
        });
        progress.done(function() {
          return trigger('doneLoading', path);
        }).fail(function(errObj) {
          return trigger('failedLoading', path);
        }).always(function() {
          return trigger('alwaysLoading', path);
        });
        return progress.promise();
      };
      redirectToFile = function(path) {
        log("redirectToFile( " + path + " )");
        if (isPathToFile(path)) {
          document.location.hash = path;
        } else {
          loadIndex(path).done(function() {
            var $links;
            $links = _this.cache[path];
            if ($links.length === 0) {
              return trigger('showError', "" + path + " has no content");
            } else {
              return redirectToFile($links.first().attr('href').substr(1));
            }
          }).fail(function(errObj) {
            return trigger('showError', errObj);
          });
        }
        return _this;
      };
      loadIndex = function(indexPath) {
        var dfd;
        log("loadIndex( " + indexPath + " )");
        dfd = new $.Deferred();
        if (_this.cache[indexPath] != null) {
          dfd.resolve();
        } else {
          $.get(getAjaxPath(indexPath), function(responseText) {
            var $links, showExtension;
            showExtension = _this.options.showExtension;
            $links = $(responseText).find(_this.options.linkSelector).addClass(linkClass).text(function(idx, oldValue) {
              var fullName;
              fullName = decodeURI($(this).attr('href'));
              if (showExtension === false) fullName = clipExtension(fullName);
              return fullName;
            }).attr('href', function(idx, oldValue) {
              if (oldValue.charAt(0) === '/') {
                return '#' + decodeURI(oldValue);
              } else {
                return '#' + decodeURI(indexPath + oldValue);
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
      linkSelector: 'a:not([href^="?"],[href^="/"],[href^="../"])',
      startUpdate: [hideError],
      doneUpdate: [],
      startLoading: [showLoadingNotice],
      failedLoading: [],
      doneLoading: [],
      alwaysLoading: [hideLoadingNotice],
      destroyIndex: [destroyIndex],
      createIndex: [createIndex],
      loadImage: [loadImage],
      loadText: [loadText],
      loadHtml: [loadHtml],
      loadDefault: [download],
      hideContent: [hideContent],
      showContent: [showContent],
      showError: [showError],
      destroy: [hideLoadingNotice, hideError],
      timeout: 10000,
      recursion: false,
      showExtension: false
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
