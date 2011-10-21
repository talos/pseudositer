To use Pseudositer, your server must automatically generate hyperlinked index pages for the directories you want to see.  To do so on an Apache server, include the option

    Options +Indexes

for the appropriate paths in your `httpd.conf` file or in the directories `.htaccess` file.  Look [here](http://httpd.apache.org/docs/2.0/mod/core.html#options) for more information about writing options in Apache, and [here](http://httpd.apache.org/docs/2.0/mod/mod_autoindex.html) for more information on Apache's index page generator.

Pseudositer does *not* work with a browser accessing files locally (when `file:` appears in the location bar).
