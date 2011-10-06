/** 
  * Default jasmine-jquery fixtures directory makes more
  * sense for bigger projects, methinks.
  */ 
jasmine.getFixtures().fixturesPath = 'fixtures';

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
  * 'pseudositer-always' event to fire upon an element.
  *
  * @param $elem the element to observe.
  */
var waitForPseudositer = function( $elem ) {
	waitForEvent( $elem, 'pseudositer-always', 1000 );
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

var $elem,

/**
 * Save our original state at initialization.
 */
preloadFragment = "";

if( document.location.protocol === "file:" ) {
	alert( "Tests must be run on a server." );
	beforeEach(function() {
		throw "Tests must be run on a server.";
	});
}

/**
  * Retrieve the preload fragment.
  *
  * @return {String} the preload fragment
  */
getPreloadFragment = function() {
	return preloadFragment;
};

/**
  * Set the preload fragment
  *
  * @param newPreloadFragment {String} the new preload fragment
  */
setPreloadFragment = function( newPreloadFragment ) {
	preloadFragment = newPreloadFragment;
};

beforeEach(function() {
	/**
	 * Reset state
	 **/
	setFragment("");
});

afterEach(function() {
	setFragment("");
	runs(function() {
		preloadFragment = "";
	});
});

