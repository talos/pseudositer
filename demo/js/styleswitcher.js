/* This script allows for dynamic selection of styles on a page. */

$( document ).ready( function() {

  /* Find available stylesheets on the page */
  $links = $( 'link[rel*="style"]' );

  /* Create switcher form */
  $switcher = $( '<select />' ).appendTo( $( '#styleswitcher' ) )
    .before( $( '<hr /> ') )
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
});