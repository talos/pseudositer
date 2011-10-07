describe('pseudositer', function() {
	var $elem,
	pseudoPath = 'fixtures/deep/',
	realPath = getIndexPath() +'/'+ pseudoPath;

	/**
	 * Load fixtures.
	 **/
	beforeEach(function() {
		setFixtures( $( '<div />' ).attr( 'id', 'pseudositer' ) );
		$elem = $('#pseudositer');
	});

	afterEach(function() {
		runs(function() {
			$elem.data('pseudositer').destroy();
		});
	});
	
	it('should delve to deepest level', function() {
		$elem.pseudositer( pseudoPath );
		waitForPseudositer( $elem );
		runs(function() {
			expect(document.location.hash).toEqual( '#/a/b/c/d/e/content.html' );
		});
	});

});