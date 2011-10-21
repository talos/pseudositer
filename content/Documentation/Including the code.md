### Getting your server ready

To use Pseudositer, your server must automatically generate hyperlinked index pages for the directories you want to see.  To do so on an Apache server, include the option

    Options +Indexes

for the appropriate paths in your `httpd.conf` file or in the directories `.htaccess` file.  Look [here](http://httpd.apache.org/docs/2.0/mod/core.html#options) for more information about writing options in Apache, and [here](http://httpd.apache.org/docs/2.0/mod/mod_autoindex.html) for more information on Apache's index page generator.

Pseudositer does not work with a browser accessing files locally (using the `file:` scheme).

### Including pseudositer on your page

Place the following code within your HTML page's `<head>` declaration, modifying the path to the pseudositer and jQuery source if need be.

    <!-- jQuery -->
    <script type="text/javascript" src="lib/jquery/jquery-1.6.4.min.js"></script>
    
    <!-- pseudositer -->
    <script type="text/javascript" src="lib/pseudositer/pseudositer.js"></script>
    <script type="text/javascript">
      $(document).ready(function() {
        $('#pseudositer').pseudositer('path/to/content/index/');
      });
    </script>

With the above, you should include a tag with the id `pseudositer` somewhere in the page's body.

    <body>
      <div id="pseudositer" />
    </body>

Likewise, modify the `path/to/content/index/` argument to reflect where your site's content is located.  This will be resolved relative to the HTML page.  You can also use absolute paths, or relative paths starting with `../`.  Pseudositer can display any content on your server that is visible to the public.