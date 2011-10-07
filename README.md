# pseudositer

*content management for the l a z y*

- - -

### what it is

Pseudositer is a jQuery plugin that dynamically populates a single page with content from AJAX requests for Apache (or equivalent) index pages. This means you can turn a hierarchy of text, image, and other files into a functional site navigated within one HTML file and with nary a line of special server-side code.

The mapping of directories onto the output page is very flexible, and is by default non-hierarchical. Content can reside at any level, and can coexist with folders. The plugin can be passed a series of extension mappings to load different types of files into the page in different ways. By default, images are loaded within an image tag, while .txt and .html files are loaded within a div. All other extensions turn into download links.

The plugin handles the generation of an attractive address hash automatically. This hash mimics the functionality of regular links, reflecting the user's current location and allowing them to return to it or post it elsewhere.

Content and directories are cached and not reloaded unless the user reloads the page itself.

- - -

### getting started

Getting started with Pseudositer is easy. Make sure to include

    <!-- jQuery -->
    <script type="text/javascript" src="lib/jquery/jquery-1.6.4.min.js"></script>
    
    <!-- pseudositer -->
    <script type="text/javascript" src="lib/pseudositer/pseudositer.js"></script>
    <script type="text/javascript">
      $(document).ready(function() {
        $('#pseudositer').pseudositer('path/to/content/index/');
      });
    </script>

within your HTML page's `<head>` declaration, modifying the path to the pseudositer and jQuery source if need be.

Likewise, modify the `path/to/content/index` argument to reflect where your site's content is located.  This will be resolved relative to the HTML page.

- - -

### pros & cons

A fair & balanced assessment.

#### Pros:

1. Like a content management system, you have total control over the styling of all pages at all times. All links will always work.
2. It's easy to generate or reorganize a site.  Rearrange directories and place files or images using the file browser of your choice. To make a photo album, upload a folder to your content directory that has JPGs with descriptive names in it. Done!
3. The page never flashes as the user navigates, since the browser never reloads.  It is possible to integrate smooth transitions.

#### Cons:

1. The site won't degrade gracefully for users without Javascript.
2. If you're using Apache, you must have "Options +Indexes" set for all directories in the pseudosite's content.  Other server packages must generate a similar index.
3. Your links will be organized alphabetically.