###
# Add a mapping for the Markdown parser to Pseudositer.  You must load
# Showdown beforehand.  Load this after Pseudositer.
#
# <html>
#   <head>

#     <!-- jQuery -->
#     <script type="text/javascript" src="lib/jquery/jquery-1.6.4.min.js"></script>

#     <!-- Showdown -->
#     <script type="text/javascript" src="lib/showdown/showdown.min.js"></script>

#     <!-- pseudositer -->
#     <script type="text/javascript" src="lib/pseudositer/pseudositer.js"></script>
#     <script type="text/javascript" src="lib/pseudositer/pseudositer-extensions/pseudositer.showdown.js"></script>
#     <script type="text/javascript">
#       $(document).ready(function() {
#           $('#pseudositer').pseudositer('path/to/content/index/');
#       });
#    </script>
#   </head>
#   <body>
#     <div id="pseudositer" />
#   </body>
# </html>
###

(($) ->

	# A Markdown converter to reuse.
	converter = new Showdown.converter()

	# Load a file and convert it to markdown.
	#
	# @param pathToMarkdown the path to the markdown
	#
  # @return the Markdown as HTML
	loadMarkdown = ( pathToMarkdown ) ->
		dfd = new $.Deferred()
		$.get( pathToMarkdown )
			.done( ( responseText ) ->
				dfd.resolve(
					$( '<div />' ).html(
						converter.makeHtml( responseText )
					) )
			)
			.fail( ( errObj ) ->
				dfd.reject errObj.statusText
			)
		dfd

  # Extend our handlers map with markdown
  $.extend $.pseudositer.defaultMap,
    md       : loadMarkdown
    markdown : loadMarkdown

  undefined
)(jQuery)
