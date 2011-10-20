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
			$links = $( 'link[rel*="style"]' ),

			/* Create switcher form */
			$switcher = $( '<select />' ).appendTo( $el )
				.before( $( '<label /> ' ).text( 'Style:' ) );

			/* Add options to switcher */
			$links.each( function( idx, linkElem ) {
				$link = $(linkElem);

				/* Use title as name of option. */
				var title = $link.attr( 'title' );
				$option = $( '<option />' ).text( title ).attr( 'value', title );
				
				/* Default is the non-alternate 'rel' */
				if( $link.attr( 'rel' ) === 'stylesheet' ) {
					$option.attr( 'selected', true );
					linkElem.disabled = false;
				} else {
					linkElem.disabled = true;
				}

				$option.appendTo( $switcher );
			});

			/* Listen to $switcher */
			$switcher.change( function( evt ) {
				title = $switcher.val();

				/* enable stylesheet with the correct title, disable others */
				$links.each( function( idx, linkElem ) {
					$link = $( linkElem );
					
					if( $link.attr( 'title' ) === title ) {
						linkElem.disabled = false;
					} else {
						linkElem.disabled = true;
					}
				});
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