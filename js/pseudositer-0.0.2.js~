/*****

      PSEUDOSITER 0.0.2
      Copyright 2010, John Krauss
      Licensed under the MIT license.

      Requires jQuery, tested with 1.4.4
      12/15/2010..
****/

if(!window.console) {
    //alert('no console!');
    //console = {};
    window.console = {};
    window.console.log = function(string) { return false; }
    console = {};
    console.log = function(string) { return false; }
}
(function( $ ) {
    var methods = {};
    var settings = {
	hiddenUrl      : '',
	levelClass     : 'ps_',
	directoryClass : 'ps_directory',
	contentClass   : 'ps_content',
	activeClass    : 'ps_active',
	loadMap        : {
	    '.html' : methods['loadHtml'],
	    '.htm'  : methods['loadHtml'],
	    '.txt'  : methods['loadText'],
	    '.jpg'  : methods['loadImage'],
	    '.jpeg' : methods['loadImage'],
	    '.gif'  : methods['loadImage'],
	    '.png'  : methods['loadImage']
	},
	defaultLoad    : methods['loadLink'],
	linkSelector   : 'a:not([href^=?],[href^=/])', // Find links from a directory listing that go deeper
	nonAlphanumeric: /[^a-z0-9]/gi,
	extensionsRegex: /\.[^.]*[^\/]$/, // todo move this stuff to globals area
	preprocessName : function(name) {
	    return decodeURIComponent(name).replace(/^[_|]*/, '').replace(/\.[^.]*[^\/]$/, '');  // "_" sorts to front, "|" sorts to back
	}
    };
    var load = function(url) { // The abstract load function.
	var urlSplit = url.split('/');
	console.log(urlSplit);
	for(var level = 0; level < urlSplit.length; level++) {
	    var urlToThisLevel = urlSplit.slice(0, level).join('/');
	    
	    // Load a directory.
	    if(level < urlSplit.length)  {
		
		// Use an existing element if possible.
		var $directory = $('.' + settings.directoryClass + '.' + settings.levelClass + level);
		
		if(!$directory.length) {
		    $directory = $('<div>').addClass(settings.directoryClass + ' ' + settings.levelClass + level);
		    $('body').append($directory);
		}
		
		console.log($directory);
		if($directory.find('.' + settings.activeClass).attr('href') == urlSplit[level]) {
		    console.log('already loaded');
		    // We already have loaded this level.  Continue to the next one.
		    continue;
		}
		
		$('.' + settings.contentClass).children('.' + settings.activeClass).trigger('hide.pseudositer'); // Hide any active children.
		$directory.load(settings.hiddenUrl + urlToThisLevel + ' ' + settings.linkSelector, function(responseText, textStatus) {
			if(textStatus != 'success') {
			    $.error('Could not load directory ' + settings.hiddenUrl + urlToThisLevel);
			    return;
			}
			$.each($(this).children('a'), function() {
				var $link = $(this);
				// Convert each link into a pseudolink.
				var name = settings.preprocessName($link.attr('href')); // Get the name from the link, because the text is often truncated.
				$link.text(name);
				$link.attr('href', '#' + decodeURIComponent(urlToThisLevel) + name); // This gives us an attractive hashtag.
			    });
			//$link.pseudositer('activateDefaultLink');
		    });
	    } else { // Load a file.
		/*		var extension = url.match(settings.extensionsRegex) || [''];
		var $content = $('.' + settings.contentClass);
		$content.children('.' + settings.activeClass).trigger('hide.pseudositer').removeClass(settings.activeClass);
		var $contentElem = $content.find('#' + id);
		if(!$contentElem.length) {
		    $contentElem = $('<div>').attr('id', id).addClass(settings.activeClass)
			.bind('hide.pseudositer', methods['hide'])
			.bind('show.pseudositer', methods['show'])
			.appendTo($content).hide();
		    if(settings.loadMap[extension])
			settings.loadMap[extension].call($contentElem, settings);
		    else
			settings.defaultLoad.call($contentElem, settings);
		} else {
		    $contentElem.trigger('show.pseudositer').addClass(settings.activeClass);
		    }*/
	    }
	}
    };
    methods = {
	'init'     : function(options) { // Initialized on a link.
	    return this.each(function() {
		    var $link = $(this);

		    settings.hiddenUrl = $link.attr('href');
		    $.extend(true, settings, options);

		    $link.attr('href', '#');
			
		    //$content.bind('empty.pseudositer', methods.empty);
		    var $content = $('.' + settings.contentClass);
		    if(!$content.length) {
			$content = $('<div>').addClass(settings.contentClass);
			$(document).append($content);
		    }
		    
		    // Bind all hashtag links to the pseudositer load.
		    $('a').live('click', function() {
			    if($(this).attr('href').charAt(0) == '#') {
				$(this).pseudositer('load');
			    } else {
				return true;
			    }
			});
		    $link.click(); // start the process.
		});
	},
	'destroy': function() {
	    return this.each(function() {
		    this.unbind('.pseudositer');
		});
	},
	'load' : function(event) { // Load a link.
	    return $.each($(this), function() {
		    $link = $(this);
		    console.log('loading');
		    $link.addClass(settings.activeClass);
		    console.log($link);
		    load(window.location.hash);
		    /*
		    if($link.hasClass(settings.activeClass))
			return;
		    
		    if(!$link.parent().hasClass(settings.directoryClass)) // If this isn't part of the interface, treat it as a regular link.
			return;
		    
		    $link.siblings().removeClass(settings.activeClass);
		    $link.addClass(settings.activeClass);
		    
		    if (window.location.hash.split('/')[settings.level] == '' ||
			!window.location.hash.split('/')[settings.level]) { // If there's already a hashtag specified, leave it.
			window.location.hash = settings.preprocessName(settings.visibleUrl); // Force hashtag otherwise.
		    }
		    var url = settings.hiddenUrl + settings.visibleUrl;
		    var id = 'ps_' + url.replace(settings.nonAlphanumeric, '__');
		    
		    var $content = $('.' + settings.contentClass);
		    $('.' + settings.directoryClass).each(function() { // Clear out all directories remaining above this one:
			    if($(this).data('level') > settings.level) {
				//$(this).trigger('empty.pseudositer');
				$(this).hide();
			    }
			});
		    */
		});
	},
	'empty': function(event, callback, arguments) {
	    //return $(this).fadeOut('fast', function() {
	    return $(this).slideUp('fast', function() {
		    $(this).empty().show()
		    if(callback) {
			callback.call($(this), arguments);
		    }
		});
	},
	'hide' : function(event, callback, arguments) {
	    return $(this).slideUp('fast', function() {
		    if(callback) {
			callback.call($(this), arguments);
		    }
		});
	},
	'show' : function(event, callback, arguments) {
	    //return this.fadeIn('fast', function() { if(callback) { callback.call(this, options);} });
	    //return this.slideDown('fast', function() { if(callback) { callback.call(this, options);} });
	    return $(this).fadeIn('fast', function() {
		    if(callback) {
			callback.call($(this), arguments);
		    }
		});
	},
	'loadHtml' : function(options, callback) {
	    return this.load(options.hiddenUrl + options.visibleUrl, function() {
		    //$(this).pseudositer('show', options, callback)}
		    $(this).trigger('show.pseudositer');
		});
	},
	'loadText': function(options, callback) {
	    return this.load(options.hiddenUrl + options.visibleUrl, function() {
		    //$(this).pseudositer('show', options, callback)}
		    $(this).trigger('show.pseudositer');
		});
	},
	'loadImage': function(options, callback) {
	    console.log('loadImage');
	    return this.append($('<a>').attr('href', options.hiddenUrl + options.visibleUrl).append($('<img>').attr('src', options.hiddenUrl + options.visibleUrl))).trigger('show.pseudositer');
	},
	'loadLink' : function(options, callback) {
	    return this.append($('<a>').attr('href', options.hiddenUrl + options.visibleUrl).append(decodeURIComponent(options.visibleUrl))).trigger('show.pseudositer');
	},
	'activateDefaultLink' : function() {
	    return this.each(function() {
		    var $link = $(this);
		    var settings = $link.data('settings')
		    var $directory = $('.' + settings.directoryClass + '.' + settings.levelClass + (settings.level));
		    var hash = window.location.hash.split('/')[settings.level];
		    if(hash) {
			//hash = hash.replace(/([!\"$%&\'()*+,.\/:;?@\[\\\]\^`{|}~])/g,'\\\\$1'); // Escape selector-like characters.
			hash = hash.replace(/([\"])/g, '\\\\$1'); // Escape quotations.  Currently crashing on single quotes...
			$directory.children("a[href*='" + hash + "']").first().click();
		    } else {
			$directory.children('a').first().click();
		    }
		});
	}
    };
    
    $.fn.pseudositer = function(method) {
	if ( methods[method] ) {
	    return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	} else if ( typeof method === 'object' || ! method ) {
	    return methods.init.apply( this, arguments );
	} else {
	    $.error( 'Method ' +  method + ' does not exist in pseudositer.' );
	}
    };
})( jQuery );
