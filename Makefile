all:
	@echo Generating pseudositer javascript from coffee...
	coffee -o lib/pseudositer -c src/*.coffee

	@echo Generating pseudositer extensions javascript from coffee...
	coffee -o lib/pseudositer/extensions -c src/extensions/*.coffee

	@echo Minifying the javascript...
	uglifyjs lib/pseudositer/pseudositer.js > lib/pseudositer/pseudositer.min.js
	uglifyjs lib/pseudositer/extensions/pseudositer.markdown.js > lib/pseudositer/extensions/pseudositer.markdown.min.js

clean:
	@echo Cleaning lib/pseudositer...
	rm -f lib/pseudositer/*.js
	rm -f lib/pseudositer/extensions/*.js