The pseudositer object lives inside `.data( 'pseudositer' )` for its element.  Methods can be called like this:

     $( '#pseudositer' ).data( 'pseudositer' ).destroy();

All methods return the original element and can be chained:

     $( '#pseudositer' ).data( 'pseudositer' ).destroy().remove();

- - -
### <a name="pseudositer">.pseudositer()</a>

Apply pseudositer to the selected elements with the default options.
- - -
### <a name="pseudositerOptions">.pseudositer( `options` )</a>

* `options` a Javascript object mapping option names to values.

Apply pseudositer to the selected elements with the specified options.
- - -
### <a name="setRecursion">.setRecursion( `recursionValue` )</a>

* `recursionValue` `true` to enable recursion, `false` to disable recursion.

Enable or disable recursion.  Calling this method will cause pseudositer to immediately refresh the page.  This can be set at initialization using the recursion option.
- - -
### <a name="destroy">.destroy()</a>

Empty out the pseudositer element and unbind all event monitors.
- - -