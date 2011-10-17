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
    var clipExtension, contentClass, createIndex, destroyIndex, download, errorClass, events, getClassForPath, getContentContainer, getCurrentFragment, getCurrentPath, getIndexClassForLevel, getIndexContainer, getIndexLevel, getIndexTrail, getPathDepth, getSuffix, hideContent, hideError, hideLoadingNotice, indexClass, indexContainerClass, isPathToFile, linkClass, loadHtml, loadImage, loadText, loadingClass, log, selectLink, selectedLinkClass, showContent, showError, showLoadingNotice, staleClass, updateLinkClasses;
    events = ['startUpdate', 'doneUpdate', 'startLoading', 'failedLoading', 'doneLoading', 'alwaysLoading', 'destroyIndex', 'createIndex', 'selectLink', 'hideContent', 'showContent', 'showError', 'destroy'];
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
    selectedLinkClass = 'pseudositer-link-selected';
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
      if (this.logging) log("isPathToFile( " + path + " )");
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
    updateLinkClasses = function(path) {
      var $link;
      $link = $("." + linkClass + "[href=\"\#" + path + "\"]");
      $link.siblings("." + linkClass).removeClass(selectedLinkClass);
      return $link.addClass(selectedLinkClass);
    };
    loadImage = function(pathToImage) {
      var $img, $tmp, dfd;
      $tmp = $('<div />').css({
        height: '0px',
        width: '0px'
      }).appendTo($('body'));
      dfd = new $.Deferred();
      $img = $('<a />').attr('href', pathToImage).append($('<img />').attr('src', pathToImage).bind('load', function() {
        dfd.resolve($img);
        return $tmp.remove();
      }).bind('error', function() {
        $tmp.remove();
        return dfd.reject('Could not load image at ' + pathToImage);
      }));
      return dfd.promise();
    };
    loadText = function(pathToText) {
      var dfd;
      dfd = new $.Deferred();
      $.get(pathToText).done(function(responseText) {
        return dfd.resolve($('<div />').append($('<pre />').text(responseText)));
      }).fail(function(errObj) {
        return dfd.reject(errObj.statusText);
      });
      return dfd.promise();
    };
    loadHtml = function(pathToHtml) {
      var dfd;
      dfd = new $.Deferred();
      $.get(pathToHtml).done(function(responseText) {
        return dfd.resolve($(responseText));
      }).fail(function(errObj) {
        return dfd.reject(errObj.statusText);
      });
      return dfd.promise();
    };
    download = function(pathToFile) {
      return new $.Deferred().resolve($('<a />').text(pathToFile).attr('href', pathToFile));
    };
    /*
      #
      # Default handlers -- these are all called with the pseudositer object
      # as this.
      #
    */
    showLoadingNotice = function(evt, path) {
      var $loadingNotice, classForPath;
      if (this.logging) log("showLoadingNotice( " + path + " )");
      classForPath = getClassForPath(path);
      $loadingNotice = $('<div />').hide().text("Loading " + path + "...").addClass("" + loadingClass + " " + classForPath).appendTo(this).fadeIn('fast');
      return;
    };
    hideLoadingNotice = function(evt, path) {
      var $elem, classForPath;
      if (this.logging) log("hideLoadingNotice( " + path + " )");
      if (path != null) {
        classForPath = getClassForPath(path);
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
      if (this.logging) {
        log("destroyIndex( " + dfd + ", " + aboveIndexLevel + " )");
      }
      destroyed = new $.Deferred().resolve();
      $('.' + indexClass).each(function(idx, elem) {
        var $index, idxDestroy;
        $index = $(elem);
        if (getIndexLevel($index) > aboveIndexLevel) {
          idxDestroy = new $.Deferred(function(idxDestroy) {
            return $index.fadeOut('fast', function() {
              return idxDestroy.resolve();
            });
          });
          return destroyed = destroyed.pipe(function() {
            return idxDestroy;
          });
        }
      });
      destroyed.done(function() {
        return dfd.resolve();
      });
      return;
    };
    createIndex = function(evt, dfd, path, $links) {
      var $index, indexLevel, levelClass, prevPath, showIndex;
      if (this.logging) {
        log("createIndex( " + dfd + ", " + path + ", " + $links + " )");
      }
      indexLevel = path.split('/').length - 2;
      levelClass = getIndexClassForLevel(indexLevel);
      $index = $('.' + levelClass);
      if ($index.length === 0) {
        $index = $('<div />').addClass(indexClass + ' ' + levelClass).hide();
        getIndexContainer(this).append($index);
      }
      if (!$index.data('pseudositer')) $index.data('pseudositer', {});
      prevPath = $index.data('pseudositer').path;
      showIndex = new $.Deferred().done(function() {
        return $index.fadeIn('fast', function() {
          return dfd.resolve();
        });
      });
      if (path === prevPath) {
        showIndex.resolve();
      } else {
        $index.fadeOut('fast', function() {
          $index.empty().data('pseudositer', {
            path: path
          }).append($links);
          return showIndex.resolve();
        });
      }
      return;
    };
    selectLink = function(evt, dfd, path, $link) {
      dfd.resolve();
      return;
    };
    hideContent = function(evt, dfd) {
      var $content;
      if (this.logging) log("hideContent( " + dfd + " )");
      $content = getContentContainer(this).children();
      if ($content.length === 0) {
        dfd.resolve();
      } else {
        $content.fadeOut('fast', function() {
          $content.detach();
          return dfd.resolve();
        });
      }
      return;
    };
    showContent = function(evt, dfd, $elem) {
      var $container;
      if (this.logging) log("showContent( " + dfd + ", " + $elem + " )");
      $container = getContentContainer(this);
      $elem.hide().appendTo($container).fadeIn('fast', function() {
        return dfd.resolve();
      });
      return;
    };
    showError = function(evt, errObj) {
      var $error;
      if (this.logging) log("showError( " + errObj + " )");
      if (this.logging) log(errObj);
      $error = $('.' + errorClass);
      if ($error.length === 0) {
        $error = $('<div />').addClass(errorClass).appendTo(getContentContainer(this));
      }
      $error.text(errObj.toString()).fadeIn('fast');
      return;
    };
    hideError = function(evt) {
      var $error;
      if (this.logging) log("hideError( )");
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
    $.pseudositer = function(el, hiddenPath, options) {
      var getAjaxPath, load, loadContent, loadIndex, redirectToFile, showIndices, trigger, update;
      var _this = this;
      this.$el = $(el);
      this.$el.data("pseudositer", this);
      this.cache = {};
      this.init = function() {
        var event, handler, split, _i, _j, _len, _len2, _ref;
        _this.options = $.extend({}, $.pseudositer.defaultOptions, options);
        _this.map = $.extend({}, $.pseudositer.defaultMap, _this.options.map);
        _this.visiblePath = getCurrentPath();
        _this.logging = _this.options.logging;
        _this.updating = new $.Deferred().resolve().promise();
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
        if (_this.logging) log("setRecursion( " + recursion + " )");
        if ((recursion === true || recursion === false) && _this.options.recursion !== recursion) {
          _this.options.recursion = recursion;
          update();
        } else {
          throw 'new value for recursion must be true or false';
        }
        return _this;
      };
      this.destroy = function() {
        if (_this.logging) log("destroy( )");
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
        if (_this.logging) log("trigger( " + eventName + ", " + args + " )");
        _this.$el.triggerHandler("" + eventName + ".pseudositer", args);
        return _this;
      };
      getAjaxPath = function(path) {
        if (_this.logging) log("getAjaxPath( " + path + " )");
        return _this.realPath + path.substr(1);
      };
      update = function() {
        var path, updateDfd;
        if (_this.logging) log("update( )");
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
        _this.updating.always(function() {
          var loaded;
          _this.updating = updateDfd.promise();
          if (_this.cache[path] != null) {
            loaded = new $.Deferred().resolve();
          } else {
            loaded = load(path);
          }
          setTimeout((function() {
            return updateDfd.reject("Load timeout after " + _this.options.timeout + " ms");
          }), _this.options.timeout);
          return loaded.fail(function(failObj) {
            return updateDfd.reject(failObj);
          }).done(function() {
            var contentHidden, indicesShown;
            indicesShown = showIndices(path);
            contentHidden = new $.Deferred();
            trigger('hideContent', contentHidden);
            return $.when(indicesShown, contentHidden).done(function() {
              var $content, contentShown, linkSelected;
              if (isPathToFile(path)) {
                linkSelected = new $.Deferred();
                trigger('selectLink', linkSelected, path, updateLinkClasses(path));
                $content = _this.cache[path];
                contentShown = new $.Deferred().done(function() {
                  return updateDfd.resolve();
                }).fail(function(failObj) {
                  return updateDfd.reject(failObj);
                });
                return linkSelected.done(function() {
                  return trigger('showContent', contentShown, $content);
                });
              } else {
                return updateDfd.resolve();
              }
            }).fail(function(failObj) {
              return updateDfd.reject(failObj);
            });
          });
        });
        return _this;
      };
      load = function(path) {
        var progress, promises, trail, trails, _i, _len, _ref;
        if (_this.logging) log("load( " + path + " )");
        trigger('startLoading', path);
        promises = [];
        if (isPathToFile(path)) promises.push(loadContent(path));
        trails = getIndexTrail(path);
        _ref = trails.slice(0, (trails.length - 1) + 1 || 9e9);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          trail = _ref[_i];
          promises.push(loadIndex(trail));
        }
        return progress = $.when.apply(_this, promises).done(function() {
          return trigger('doneLoading', path);
        }).fail(function(errObj) {
          return trigger('failedLoading', path);
        }).always(function() {
          return trigger('alwaysLoading', path);
        });
      };
      redirectToFile = function(path) {
        if (_this.logging) log("redirectToFile( " + path + " )");
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
        if (_this.logging) log("loadIndex( " + indexPath + " )");
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
                if (_this.options.decodeUri === true) {
                  return '#' + decodeURI(oldValue);
                } else {
                  return '#' + oldValue;
                }
              } else {
                if (_this.options.decodeUri === true) {
                  return '#' + decodeURI(indexPath + oldValue);
                } else {
                  return '#' + indexPath + oldValue;
                }
              }
            });
            _this.cache[indexPath] = $links;
            return dfd.resolve();
          }).fail(function() {
            return dfd.reject("Could not load index page for " + indexPath);
          });
        }
        return dfd.promise();
      };
      loadContent = function(pathToContent) {
        var handler, loadedIntoCache, promise, suffix;
        if (_this.logging) log("loadContent( " + pathToContent + " )");
        suffix = getSuffix(pathToContent);
        loadedIntoCache = new $.Deferred();
        handler = _this.map[suffix] != null ? _this.map[suffix] : _this.map[''];
        promise = handler(getAjaxPath(pathToContent));
        promise.done(function($content) {
          _this.cache[pathToContent] = $content;
          return loadedIntoCache.resolve();
        }).fail(function(errObj) {
          return loadedIntoCache.reject(errObj);
        });
        return loadedIntoCache.promise();
      };
      showIndices = function(path) {
        var indicesDestroyed, promises, trails;
        if (_this.logging) log("showIndices( " + path + " )");
        indicesDestroyed = new $.Deferred();
        trigger('destroyIndex', indicesDestroyed, getPathDepth(path));
        trails = getIndexTrail(path);
        promises = [indicesDestroyed.promise()];
        $.each(trails, function(idx, trail) {
          var $links, indexCreated, lastPromise, linkSelected;
          $links = _this.cache[trail];
          lastPromise = promises[promises.length - 1];
          indexCreated = new $.Deferred();
          linkSelected = new $.Deferred();
          lastPromise.done(function() {
            return trigger('selectLink', linkSelected, trail, updateLinkClasses(trail));
          });
          linkSelected.done(function() {
            return trigger('createIndex', indexCreated, trail, $links);
          });
          return promises.push(indexCreated.promise());
        });
        return promises[promises.length - 1];
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
      selectLink: [selectLink],
      hideContent: [hideContent],
      showContent: [showContent],
      showError: [showError],
      destroy: [hideLoadingNotice, hideError],
      logging: false,
      timeout: 10000,
      recursion: false,
      showExtension: false,
      decodeUri: false
    };
    $.pseudositer.defaultMap = {
      png: loadImage,
      gif: loadImage,
      jpg: loadImage,
      jpeg: loadImage,
      txt: loadText,
      html: loadHtml,
      '': download
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
