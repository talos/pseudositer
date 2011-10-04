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
  * @param address the address to set the address bar to.
  */
var setAddress = function( address ) {
	runs(function() {
		History.replaceState( null, null, address );
	});
};

