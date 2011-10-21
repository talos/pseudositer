Options are set by passing an options object to the `.pseudositer( options )` constructor.

- - -
### <a name="linkSelector">linkSelector</a>

**default:** `a:not([href^="?"],[href^="/"],[href^="../"])`

A jQuery selector that is used to extract links from index pages.  By default, pseudositer will display and follow all links that do not start with `?`, `/`, or `../`.
- - -
### <a name="recursion">recursion</a>

**default:** `false`

Whether pseudositer should automatically look for content inside directories.  If this option is `true` and the current path is an index (it ends in `/`), pseudositer will navigate to the first link in the displayed directory.  It will continue to do so until it is displaying a file.

This option can be modified after initialization by using the [setRecursion](Methods#wiki-setRecursion) method.
- - -
### <a name="showExtension">showExtension</a>

**default:** `false`

Whether pseudositer should include file extensions in the text of links.  By default, a link to `Content.html` will be rendered as `Content`.