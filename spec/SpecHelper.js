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
  * 'pseudositer-loaded' event to fire upon an element.
  *
  * @param $elem the element to observe.
  */
var waitForPseudositer = function( $elem ) {
	waitForEvent( $elem, 'loaded.pseudositer', 1000 );
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

if( document.location.protocol === "file:" ) {
	alert( "Tests must be run on a server." );
	beforeEach(function() {
		throw "Tests must be run on a server.";
	});
}

/**
  * Remove the fragment after each test.
  */
afterEach(function() {
	runs(function() {
		document.location.hash = "";
	});
});

