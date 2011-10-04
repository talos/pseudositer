describe('pseudositer', function() {
	/**
	 * Load fixtures.
	 **/
	beforeEach(function() {
		runs(function() {
			setFixtures( $( '<div />' ).attr( 'id', 'pseudositer' ) );
			$elem = $('#pseudositer').pseudositer( 'fixtures/deep/' );
		});
	});

	afterEach(function() {
		runs(function() {
			$elem.data('pseudositer').destroy();
		});
	});
	
	it('should delve to deepest level', function() {
		expect(document.location.hash).toEqual( '' );
	});

});