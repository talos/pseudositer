Pseudositer triggers events upon its own element.  If `#pseudositer` is your pseudositer element, you can observe the events with the following

    $('#pseudositer').bind('event.pseudositer', function() {
      // ... code ...
    });

All pseudositer events are unbound when the plugin is destroyed.  Most events have arguments in addition to the event object.
- - -
### <a name="startUpdate.pseudositer">startUpdate.pseudositer</a> _function( `evt`, `path` )_

* `evt` the event object
* `path` the path that pseudositer is updating to display, relative to the content directory
# `fullPath` the absolute path that pseudositer is updating to display

Triggered when pseudositer begins to update.
- - -
### <a name="doneUpdate.pseudositer">doneUpdate.pseudositer</a> _function( `evt` )_

* `evt` the event object
* `path` the path that pseudositer is updating to display, relative to the content directory
# `fullPath` the absolute path that pseudositer is updating to display

Triggered when pseudositer is done updating.
- - -
### <a name="startLoading.pseudositer">startLoading.pseudositer</a> _function( `evt`, `path` )_

* `evt` the event object
* `path` the path that pseudositer is starting to load

Triggered when pseudositer begins loading new content.  If content is already cached, this will not be fired.
- - -
### <a name="failedLoading.pseudositer">failedLoading.pseudositer</a> _function( `evt`, `path` )_

* `evt` the event object
* `path` the path that pseudositer could not load

Triggered when pseudositer fails to load a path.
- - -
### <a name="doneLoading.pseudositer">doneLoading.pseudositer</a> _function( `evt`, `path` )_

* `evt` the event object
* `path` the path that pseudositer successfully loaded

Triggered when pseudositer has successfully loaded a path
- - -
### <a name="alwaysLoading.pseudositer">alwaysLoading.pseudositer</a> _function( `evt`, `path` )_

* `evt` the event object
* `path` the path that pseudositer loaded successfully or failed to load

Triggered once after either doneLoading or failedLoading
- - -
### <a name="destroyIndex.pseudositer">destroyIndex.pseudositer</a> _function( `evt`, `dfd`, `aboveIndexLevel` )_

* `evt` the event object
* `dfd` A jQuery Deferred object.  This should be resolved when all the necessary indices are no longer visible, or rejected if there was an error doing this.
* `aboveIndexLevel` the 0-based index level above which indices should no longer be visible.  For example, if the user just navigated to `#/`, this would be `0`.  All indices of level 1 or more should be removed.

Triggered when indices above a certain level should be removed from display.
- - -
### <a name="createIndex.pseudositer">createIndex.pseudositer</a> _function( `evt`, `dfd`, `path`, `$links` )_

* `evt` the event object
* `dfd` A jQuery Deferred object.  This should be resolved when the index has been created, or rejected if there was an error doing this.
* `path` The path to the index that is being created
* `$links` An array of links from the index

Triggered when an index to a certain path should be created with the specified links.
- - -
### <a name="hideContent.pseudositer">hideContent.pseudositer</a> _function( `evt`, `dfd` )_

* `evt` the event object
* `dfd` A jQuery Deferred object that should be resolved once the content is hidden.

Triggered when existing content should be hidden
- - -
### <a name="showContent.pseudositer">showContent.pseudositer</a> _function( `evt`, `dfd`, `$content` )_

* `evt` the event object
* `dfd` A jQuery Deferred object that should be resolved once the content is displayed.
* `$content` A DOM element with the content that should be shown

Triggered when new content should be shown 
- - -
### <a name="showError.pseudositer">showError.pseudositer</a> _function( `evt`, `errObj` )_

* `evt` the event object
* `errObj` a javascript object with the error

Triggered when an error should be displayed
- - -
### <a name="destroy.pseudositer">destroy.pseudositer</a> _function( `evt` )_

* `evt` the event object

Triggered after a call to `destroy()`, but before handlers are unbound.