/* This script creates a form that can be used to change up pseudositer options on a page. */

$( document ).ready( function() {
	var oldPlug, defaultPseudopath;
	defaultPseudopath = '../fixtures/';

	// Create form
	$( '#pseudopather' ).prepend(
		$('<div />')
			.append($('<form />')
					.append($('<label />').attr( 'for', 'pseudopath' ).text( 'Pseudopath:' ))
					.append($('<input />').attr( { type: 'text', name: 'pseudopath', id: 'pseudopath' } ))
					.append( $('<label />').attr( 'for', 'recursion' ).text( 'Recursion:' ))
					.append( $('<input />').attr( { type: 'checkbox', name: 'recursion', id: 'recursion' } ))
					.append( $('<button />').attr( 'id', 'pseudopather-submit' ).text( 'Submit' )))
			.append($('<a />').attr({ href: 'javascript:null', id: 'pseudopather-preview' }))
			.append($('<iframe />').hide().attr( 'id', 'pseudopather-iframe' ).css({ width: '95%', height: '250px' })))
		.append( $('<hr />') );

	// Handle submit
	$( '#pseudopather-submit' ).click( function() {

		var oldPlug = $( '#pseudositer' ).data( 'pseudositer' ),
		pseudopath = $( '#pseudopath' ).val();

		/* Remove the prior plugin if this was already initialized. */
		if( typeof oldPlug !== 'undefined' && oldPlug !== null ) {
			oldPlug.destroy();
		}

		/* Initialize pseudositer with the value of the input. */
		$('#pseudositer').pseudositer(
			pseudopath,
			{
				recursion : $('#recursion').is(':checked')
			}
		);

		/* Change the src of the iframe */
		$('#pseudopather-iframe').attr( 'src', pseudopath );

		/* Always update iframe to show current path. */
		$('#pseudositer').bind( 'doneUpdate.pseudositer', function( evt, path, fullPath ) {
			$('#pseudopather-iframe').attr( 'src', fullPath );
			$('#pseudopather-preview').text( fullPath );
		});

		return false;
    });


	/* Hide the preview on click */
	$('#pseudopather-preview').click( function() {
		$('#pseudopather-iframe').toggle();
	});

	/* Change recursion value upon click. */
	$('#recursion').click( function() {
		$('#pseudositer')
			.data( 'pseudositer' )
			.setRecursion( $(this).is( ':checked' ) );
	});

	/* Prevent default form submission */
	$('form').submit(function() {
		/*$( '#pseudopather-submit' ).click(); */
		return false;
    });

    /* Click when the page first loads. */
    $( '#pseudopath' ).val( defaultPseudopath );
	$(' #pseudopather-submit' ).click();
});
