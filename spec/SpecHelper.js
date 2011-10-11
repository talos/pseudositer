/**
  * Global pseudositer element.
  */
var $elem;

/** 
  * Default jasmine-jquery fixtures directory makes more
  * sense for bigger projects, methinks.
  */ 
jasmine.getFixtures().fixturesPath = 'fixtures';

/**
  * Ajax requests don't work right on file systems, and
  * index pages are generated by the browser.  Tests would
  * be meaningless.
  */
if( document.location.protocol === "file:" ) {
	alert( "Tests must be run on a server." );
	beforeEach(function() {
		throw "Tests must be run on a server.";
	});
}

/**
  * Wait for an event to fire on an element.
  *
  * @param $elem the element to observe
  * @param eventName the name of the event to wait for
  * @param timeout how many milliseconds to wait for
  */
var waitForEvent = function( $elem, eventName, timeout ) {
	var eventFired = false;
	$elem.one( eventName, function() {
		eventFired = true;
	});
	waitsFor(function() {
		return eventFired === true;
	}, timeout, eventName + " to fire on " + $elem.attr('id'));
};

/**
  * Convenience method that waits 1 second for the
  * 'alwaysLoading.pseudositer' event to fire upon an element.
  *
  * @param $elem the element to observe.
  */
var waitForPseudositer = function( $elem ) {
	waitForEvent( $elem, 'alwaysLoading.pseudositer', 1000 );
};

/**
  * Synchronously change the address bar to an address,
  * by wrapping the call in a "runs" block.
  *
  * @param fragment the fragment to set in the address bar.
  */
var setFragment = function( fragment ) {
	runs(function() {
		document.location.hash = fragment;
	});
};

/**
  * @return {String} path to the index of the executing HTML.
  * Does not include trailing slash.
  */
var getIndexPath = function( ) {
	ary = document.location.pathname.split('/');
	return ary.slice(0, ary.length - 1).join('/');
};

/**
  * @param pseudoPath a {String} pseudoPath
  *
  * @return {String} absolute path to the pseudoPath.
  */
var getRealPath = function( pseudoPath ) {
	return getIndexPath() +'/'+ pseudoPath;
};

/**
  * Load fixtures before each run.
  **/
beforeEach(function() {
	setFixtures( $( '<div />' ).attr( 'id', 'pseudositer' ) );
	$elem = $('#pseudositer');
});

/**
  * Clear plugin after each run.
  */
afterEach(function() {
	runs(function() {
		if( typeof $elem.data('pseudositer') !== 'undefined' && $elem.data('pseudositer') !== null) {
			$elem.data('pseudositer').destroy();
		}
	});
});
