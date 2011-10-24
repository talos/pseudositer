all:
	@echo Generating pseudositer javascript from coffee...
	coffee -o lib/pseudositer -c src/*.coffee

	@echo Generating pseudositer extensions javascript from coffee...
	coffee -o lib/pseudositer/extensions -c src/extensions/*.coffee

	@echo Minifying the javascript...
	uglifyjs lib/pseudositer/pseudositer.js > lib/pseudositer/pseudositer.min.js
	uglifyjs lib/pseudositer/extensions/pseudositer.markdown.js > lib/pseudositer/extensions/pseudositer.markdown.min.js

	@echo Generating templates...
	rm -r `pwd`/samples/templates
	mkdir `pwd`/samples/templates
	for style in `ls samples/styles/` ; do \
		mkdir `pwd`/samples/templates/$${style/%.css/} ; \
		cp -R `pwd`/template-skeleton/* `pwd`/samples/templates/$${style/%.css/}/ ; \
		mkdir `pwd`/samples/templates/$${style/%.css/}/css ; \
		cp `pwd`/samples/styles/$$style `pwd`/samples/templates/$${style/%.css/}/css/pseudositer-stylesheet.css ; \
		zip -r `pwd`/samples/templates/$${style/%.css/}.zip `pwd`/samples/templates/$${style/%.css/}/ ; \
	done

clean:
	@echo Cleaning lib/pseudositer...
	rm -f lib/pseudositer/pseudositer.js
	rm -f lib/pseudositer/extensions/pseudositer.markdown.js