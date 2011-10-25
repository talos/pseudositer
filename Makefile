LIB_DIR=$(CURDIR)/lib/pseudositer
SRC_DIR=$(CURDIR)/src
TEMPLATES_DIR = $(CURDIR)/samples/templates
SKELETON_DIR = $(CURDIR)/template-skeleton
SKELETON_LIB_DIR = $(SKELETON_DIR)/lib/pseudositer

all:
	@echo Generating pseudositer javascript from coffee...
	coffee -o $(LIB_DIR) -c $(SRC_DIR)/*.coffee

	@echo Generating pseudositer extensions javascript from coffee...
	coffee -o $(LIB_DIR)/extensions -c $(SRC_DIR)/extensions/*.coffee

	@echo Minifying the javascript...
	uglifyjs $(LIB_DIR)/pseudositer.js > $(LIB_DIR)/pseudositer.min.js
	uglifyjs $(LIB_DIR)/extensions/pseudositer.markdown.js > $(LIB_DIR)/extensions/pseudositer.markdown.min.js

	@echo Generating templates...
	rm -rf $(SKELETON_LIB_DIR)
	mkdir -p $(SKELETON_LIB_DIR)
	cp -r $(LIB_DIR)/* $(SKELETON_LIB_DIR)/
	rm -rf $(TEMPLATES_DIR)
	mkdir $(TEMPLATES_DIR)
	for style in `ls samples/styles/` ; do \
		STYLE_PATH=$(CURDIR)/samples/styles/$$style ; \
		STYLE_NAME=$${style/%.css/} ; \
		STYLE_TEMPLATE_DIR=$(TEMPLATES_DIR)/$$STYLE_NAME ; \
		mkdir $$STYLE_TEMPLATE_DIR ; \
		cp -R $(SKELETON_DIR)/* $$STYLE_TEMPLATE_DIR ; \
		mkdir $$STYLE_TEMPLATE_DIR/css ; \
		cp $$STYLE_PATH $$STYLE_TEMPLATE_DIR/css/pseudositer-stylesheet.css ; \
		cd $(TEMPLATES_DIR) ; \
		zip -r $$STYLE_NAME.zip $$STYLE_NAME/ ; \
	done

clean:
	@echo Cleaning $(LIB_DIR)...
	rm -f $(LIB_DIR)/pseudositer.js
	rm -f $(LIB_DIR)/extensions/pseudositer.markdown.js