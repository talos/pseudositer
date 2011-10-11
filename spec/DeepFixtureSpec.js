describe('pseudopath "fixtures/deep/"', function() {
	beforeEach(function() {
		pseudoPath = 'fixtures/deep/';
	});

	describe('when recursion is on', function() {
		it('should delve to deepest level', function() {
			runs(function() {
				$elem.pseudositer( pseudoPath, { recursion: true } );
			});
			waitForPseudositer( $elem );
			runs(function() {
				expect(document.location.hash).toEqual( '#/a/b/c/d/e/content.html' );
			});
		});
	});

	describe('when recursion is off', function() {
		it('should remain at the root level', function() {
			runs(function() {
				$elem.pseudositer( pseudoPath, { recursion: false } );
			});
			waitForPseudositer( $elem );
			runs(function() {
				expect(document.location.hash).toEqual( '#/' );
			});
		});
	});

});