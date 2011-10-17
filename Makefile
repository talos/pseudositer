all:
	@echo Generating javascript from coffee...
	coffee -o lib/pseudositer -c src/*.coffee

	@echo Minifying the javascript...
	uglifyjs lib/pseudositer/pseudositer.js > lib/pseudositer/pseudositer.min.js

clean:
	rm -f lib/pseudositer/*.js
