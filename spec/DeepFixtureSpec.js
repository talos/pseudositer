describe('pseudopath "fixtures/deep/"', function() {
	var pseudoPath = 'fixtures/deep/';

	describe('if recursion is true', function() {
		it('should delve to deepest level', function() {
			runs(function() {
				$pseudo.pseudositer( pseudoPath, { recursion: true } );
			});
			waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
			runs(function() {
				expect(document.location.hash).toEqual( '#/a/b/c/d/e/content.html' );
			});
		});
	});

	describe('if recursion is false', function() {
		it('should remain at the root level', function() {
			runs(function() {
				$pseudo.pseudositer( pseudoPath, { recursion: false } );
			});
			waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
			runs(function() {
				expect(document.location.hash).toEqual( '#/' );
			});
		});
	});

});