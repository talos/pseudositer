# pseudositer

*content management for the l a z y*

- - -

### what it is

Pseudositer is a jQuery plugin that creates a website via AJAX requests for Apache (or equivalent) index pages. Users can navigate folders of text, image, and other files within one HTML file, with nary a line of server-side code.

You can pass mappings to handle special extensions. By default, images are loaded into an `img` tag, and .txt and .html files are loaded into a `div`.

The plugin generates an address hash. Users can bookmark, browse backwards and forwards, and link within the pseudositer page's content.  Content and index listings are cached.

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

If you use the above code, make sure to include a tag with the id `pseudositer` somewhere in the page's body:

    <body>
      <div id="pseudositer" />
	</body>

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
