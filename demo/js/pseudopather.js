/* This script creates a form that can be used to change up pseudositer options on a page. */

$( document ).ready( function() {
  var oldPlug, defaultPseudopath;
  defaultPseudopath = '../fixtures/';

  // Create form
  $( '#pseudopather' ).prepend( $('<div />').append( $('<form />')
    .append( $('<label />').attr( 'for', 'pseudopath' ).text( 'Pseudopath:' ))
    .append( $('<input />').attr( { type: 'text', name: 'pseudopath', id: 'pseudopath' } ))
    .append( $('<label />').attr( 'for', 'recursion' ).text( 'Recursion:' ))
    .append( $('<input />').attr( { type: 'checkbox', name: 'recursion', id: 'recursion', checked: true } ))
    .append( $('<button />').attr( 'id', 'pseudositer-submit' ).text( 'Submit' ))))
  .append( $('<hr />') );

  // Handle submit
  $( '#pseudositer-submit' ).click( function() {

    oldPlug = $('#pseudositer').data('pseudositer');

	/* Remove the prior plugin if this was already initialized. */
	if( typeof oldPlug !== 'undefined' && oldPlug !== null ) {
	      oldPlug.destroy();
	}

	/* Initialize pseudositer with the value of the input. */
	$('#pseudositer').pseudositer(
      $('#pseudopath').val(), {
	recursion : $('#recursion').is(':checked')
      }
    );

    return false;
      });

  /* Change recursion value upon click. */
  $('#recursion').click( function() {
    $('#pseudositer')
      .data( 'pseudositer' )
      .setRecursion( $(this).is( ':checked' ) );
  });

  /* Prevent default form submission */
  $('form').submit(function() {
	/*$( '#pseudositer-submit' ).click(); */
    return false;
      });

      /* Click when the page first loads. */
      $( '#pseudopath' ).val( defaultPseudopath );
  $(' #pseudositer-submit' ).click();
});
