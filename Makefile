LIB_DIR=`pwd`/lib/pseudositer
SRC_DIR=`pwd`/src
TEMPLATES_DIR = `pwd`/samples/templates
SKELETON_DIR = `pwd`/template-skeleton

all:
	@echo Generating pseudositer javascript from coffee...
	coffee -o $(LIB_DIR) -c $(SRC_DIR)/*.coffee

	@echo Generating pseudositer extensions javascript from coffee...
	coffee -o $(LIB_DIR)/extensions -c $(SRC_DIR)/extensions/*.coffee

	@echo Minifying the javascript...
	uglifyjs $(LIB_DIR)/pseudositer.js > $(LIB_DIR)/pseudositer.min.js
	uglifyjs $(LIB_DIR)/extensions/pseudositer.markdown.js > $(LIB_DIR)/extensions/pseudositer.markdown.min.js

	@echo Generating templates...
	rm -r $(TEMPLATES_DIR)
	mkdir $(TEMPLATES_DIR)
	for style in `ls samples/styles/` ; do \
		STYLE_PATH=`pwd`/samples/styles/$$style ; \
		STYLE_TEMPLATE_DIR=$(TEMPLATES_DIR)/$${style/%.css/} ; \
		mkdir $$STYLE_TEMPLATE_DIR ; \
		cp -R $(SKELETON_DIR)/* $$STYLE_TEMPLATE_DIR ; \
		mkdir $$STYLE_TEMPLATE_DIR/css ; \
		cp $$STYLE_PATH $$STYLE_TEMPLATE_DIR/css/pseudositer-stylesheet.css ; \
		zip -r $$STYLE_TEMPLATE_DIR.zip $$STYLE_TEMPLATE_DIR/ ; \
	done

clean:
	@echo Cleaning $(LIB_DIR)...
	rm -f $(LIB_DIR)/pseudositer.js
	rm -f $(LIB_DIR)/extensions/pseudositer.markdown.js