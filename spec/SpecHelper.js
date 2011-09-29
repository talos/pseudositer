/** 
  * Default jasmine-jquery fixtures directory makes more
  * sense for bigger projects, methinks.
  */ 
jasmine.getFixtures().fixturesPath = 'fixtures';

/**
  * Save our original state at initialization.
  */
var originalState = History.getState().url;

/**
  * Restore original state after tests.
  */
afterEach(function() {
	History.replaceState(null,null, originalState);
});
