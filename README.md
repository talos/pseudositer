# pseudositer

*content management for the lazy*

- - -

## what it is

Pseudositer is a jQuery plugin that dynamically populates a single page with content from AJAX requests for index pages. This means you can turn a hierarchy of text, image, and other files into a functional site navigated within one HTML file and without a line of special server-side code.

The mapping of directories onto the output page is very flexible, and is by default non-hierarchical. Content can reside at any level, and can coexist with folders. The plugin can be passed a series of extension mappings to load different types of files into the page in different ways. By default, images are loaded within an image tag, while .txt and .html files are loaded within a div. All other extensions turn into download links.

The plugin handles the generation of an attractive address hash automatically. This hash mimics the functionality of regular links, reflecting the user's current location and allowing them to return to it or post it elsewhere.
While directories are erased and reloaded during navigation, content is only loaded the when it is initially clicked; this (to some extent) mimics caching.

- - -

## getting started

Getting started with Pseudositer is easy. Make sure to include

	<script src="js/jquery-1.4.4.min.js" type = "text/javascript"></script> 
	<script src="js/pseudositer-0.0.2.js" type = "text/javascript"></script>

within the page's `<head>` declaration, linking to wherever you have placed both the pseudositer and jQuery source.

Within the page itself, you now must specify the location of the content. This is done by "blessing" a single link, which points to this root directory. For example, if all the content you want users to see is located within a folder "myPages", create a link to it somewhere in the page's `<body>`:

       <a href="myPages/" id="pseudositer">My Pseudosite<a>
       Finally, put the following code somewhere on the page itself:
       <script type="text/javascript"> 
            $(document).ready(function() { 
	         $('#pseudositer').pseudositer(); 
	    }); 
	</script>

- - -

## pros & cons

Generating your website through pseudositer isn't all roses. There are some definite disadvantages to the system, and some definite advantages...

*Pros:*

1. Like a content management system, you have total control over the styling of all pages at all times. Also like a content management system, the interface cannot have dead links.
2. It's really, really easy to generate or reorganize a site without using any special software. Just rearrange directories and place files or images using the file browser of your choice. To make a photo album, you upload a folder to your content directory that has JPGs with descriptive names in it. Done.
3. Links internal to the site can be very pretty, including spaces, because they are processed entirely via the script. For example, "xyz.com/#odds n sods/tit for tat" instead of "xyz.com/odds%20n%20sods/tit%20for%20tat/"

*Cons:*

1. The site simply won't work on a browser that has Javascript disabled.
2. You must have "Options +Indexes" set for all directories in the pseudosite's content.
3. You have to play some games to organize links non-alphabetically. It can be done, however.