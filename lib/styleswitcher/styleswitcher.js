/* This plugin allows you to dynamically change styles on the page. */
/*

Call the plugin on a form:

$( "form#styleswitcher" ).styleswitcher();

*/

(function($) {
	/* Plugin object */
	$.styleswitcher = function( el, options ) {
		this.init = function() {
			var $el = $( el ),
			/* Find available stylesheets on the page */
			$links = $( 'link[@rel*="style"][title]' ),

			/* Create switcher form */
			$switcher = $( '<select />' ).appendTo( $el )
				.before( $( '<label /> ' ).text( 'Style:' ) ),
			
			/* Pull style name from above. */
			styleName = decodeURI( window.location.search.substr(1) );

			/* Add options to switcher */
			$links.each( function( idx ) {
				
				/* Use title as name of option. */
				var title = this.getAttribute('title'),
				$option = $( '<option />' ).text( title ).attr( 'value', title );
				
				this.disabled = true;
				if (title === styleName) {
					this.disabled = false;
					$option.attr( 'selected', true );
				} else if ( styleName === '' && this.getAttribute('rel') === 'stylesheet' ) {
					this.disabled = false; // for null title, non-alternate is enabled
				}

				$option.appendTo( $switcher );
			});

			/* Listen to $switcher */
			$switcher.change( function( evt ) {
				selectedStyle = $switcher.val();
				
				/* Refresh page */
				window.location.search = selectedStyle;
			});
		};

		return this.init();
	};

	$.fn.styleswitcher = function( options ) {
		return $.each(this, function(i, el) {
			var $el = $(el);
			// must be a form 
			if ( !$el.is('form') ) {
				$.error( "Styleswitcher must be called on a form element." );
			} else if (!$el.data('styleswitcher')) {
				return $el.data('styleswitcher', new $.styleswitcher(el, options));
			}
		});
	};
})(jQuery);