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

var $elem,

/**
 * Save our original state at initialization.
 */
originalPath = document.location.pathname,
preloadPath = null;

if( document.location.protocol === "file:" ) {
	alert( "Tests must be run on a server." );
	beforeEach(function() {
		throw "Tests must be run on a server.";
	});
}

/**
  * Retrieve the preload path.
  *
  * @return {String} the preload path
  */
getPreloadPath = function() {
	return preloadPath;
};

/**
  * Set the preload path
  *
  * @param newPreloadPath {String} the new preload path
  */
setPreloadPath = function( newPreloadPath ) {
	preloadPath = newPreloadPath;
};

beforeEach(function() {
	/**
	 * Reset state
	 **/
	runs(function() {
		History.replaceState( null, null, originalPath );
	});
	
	waitsFor(function() {
		return document.location.pathname === originalPath;
	}, 1000, "Should have reset address to " + originalPath);

	// this.addMatchers({
	// 	toHavePathFragment : function() {
			
	// 	}
	// });
});

afterEach(function() {
	runs(function() {
		preloadPath = null;
		History.replaceState( null, null, originalPath );
	});
});

