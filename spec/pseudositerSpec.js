describe('pseudositer', function() {

    /**
     * Load fixtures.
     **/
	beforeEach(function() {
		loadFixtures('simple.html');
		$('#pseudositer-simple').pseudositer('simple');
	});
	
	/*
    // not currently sure how to write this spec.
    describe('if the page is loaded for the first time', function() {
		it('should initialize pseudositer', function() {
			throw 'not yet implemented';
		});
    });
    */
	
    describe('when the page is reloaded', function() {

		it('should throw up a loading notice', function() {
			expect($('#pseudositer-loading')).toBeVisible();
		});
		
		describe('when the content is finished loading', function() {
			
			it('should remove the loading notice', function() {
				throw 'not yet implemented';
			});
			
			it('should transition in the content', function() {
				throw 'not yet implemented';
			});
		});
		
		describe('if state is root', function() {

			beforeEach(function() {
				History.replaceState(null, null, '/');
			});

			it('should display the index of the root content directory', function() {
				throw 'not yet implemented';
			});

		});

		describe('if there is a non-root state', function() {

			describe('if the state is a directory', function() {

				beforeEach(function() {
					History.replaceState(null, null, '/directory/');
				});
				
				it('should load the directory listing', function() {
					throw 'not yet implemented';
				});
			});
			
			describe('if the state is a file', function() {

				describe('including the file type', function() {
					
					beforeEach(function() {
						History.replaceState(null, null, '/hello world.txt');
					});
					
					it('should strip the file type from the state', function() {
						expect(location.pathname + location.hash).toEqual('/hello world');
					});
				});
				
				describe('not including the file type', function() {
					
					beforeEach(function() {
						History.replaceState(null, null, '/hello world');
					});

					it('should leave the state alone', function() {
						throw 'not yet implemented';

						expect(location.pathname + location.hash).toEqual('/hello world');
					});
				});

				describe('which is a text file', function() {
					
					beforeEach(function() {
						History.replaceState(null, null, '/hello world');
					});

					it('should load the text file', function() {
						throw 'not yet implemented';
					});
					
				});

				describe('which is an image', function() {

					beforeEach(function() {
						History.replaceState(null, null, '/tree');
					});
					
					it('should load the image', function() {
						throw 'not yet implemented';
					});
				});
			});
			
			
			describe('if the state is garbage', function() {
				
				var garbage = '/lkjsdiJBNC/sldkj VU&C*J##d';

				beforeEach(function() {
					History.replaceState(null, null, garbage);

				});
				
				it('should display a 404 page', function() {
					throw 'not yet implemented';
				});

				it('should not modify the state', function() {
					expect(location.pathname + location.hash).toEqual(garbage);
				});
			});
					
		});
		
		describe('if there was previously content on the page', function() {
			it('should transition out the existing content', function() {
				throw 'not yet implemented';
			});
			
			it('should not destroy the existing content', function() {
				throw 'not yet implemented';
			});

		});

		describe('if the state has been visited before', function() {
			it('should not load the content again', function() {
				throw 'not yet implemented';
			});
		});
    });

    describe('when the user clicks on a link', function() {

		describe('if the link is external', function() {
			it('should follow the link', function() {
				throw 'not yet implemented';
			});
		});

		describe('if the link is internal', function() {
			it('should push the new link state and reload', function() {
				throw 'not yet implemented';
			});
			
			it('should change the displayed state', function() {
				throw 'not yet implemented';
			});

		});
    });
});
