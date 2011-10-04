describe('pseudositer', function() {

	var $elem,

	/**
	 * Save our original state at initialization.
	 */
	originalPath = document.location.pathname;

    /**
     * Load fixtures.
     **/
	beforeEach(function() {
		/**
		 * Restore original state before each test.
		 */
		runs(function() {
			if( $('#pseudositer-simple').length > 0) {
				if( $elem.data('pseudositer') !== undefined ) {
					$elem.data('pseudositer').destroy();
				}
			}
			
			setAddress( originalPath );
		});
		
		waitsFor(function() {
			return document.location.pathname === originalPath;
		}, 1000, "Should have reset address to " + originalPath);

		runs(function() {
			loadFixtures('simple.html');
			$elem = $('#pseudositer-simple');
			$elem.pseudositer('simple/');
		});
	});

	afterEach(function() {
		runs(function() {
			$elem.data('pseudositer').destroy();
		});
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
			expect($('#pseudositer-load')).toBeVisible();
		});
		
		describe('when the content is finished loading', function() {
			
			beforeEach(function() {
				setAddress( 'hello world.txt' );
				waitForPseudositer( $elem );
			});

			it('should remove the loading notice', function() {
				runs(function() {
					expect($('#pseudositer-load')).not.toBeVisible();
				});
			});
			
			it('should transition in the content', function() {
				throw 'not yet implemented';
			});
		});
		
		describe('if state is root', function() {

			it('should replace the state with that of the deepest earliest alphabetized content', function() {
				waitForPseudositer( $('pseudositer-simple') );
				runs(function() {
					expect(document.location.pathname).toEqual('/directory/first.txt');
				});
			});
		});

		describe('if there is a non-root state', function() {

			describe('if the state is a directory', function() {

				beforeEach(function() {
					setAddress( 'directory/' );
					waitForPseudositer( $elem );
				});
				
				it('should display the links of that directory', function() {
					runs(function() {
						expect($('#pseudositer')).toContain('a[href="/directory/nested"]');
						expect($('#pseudositer')).toContain('a[href="/directory/first"]');
					});
				});
				
				it('should replace the state with that of the deepest earliest alphabetized content', function() {
					runs(function() {
						expect(document.location.pathname).toEqual('/directory/first');
					});
				});

				it('should load the deepest earliest alphabetized content in that directory', function() {
					runs(function() {
						expect($('#pseudositer-content')).toHaveText('first blood');
					});
				});
			});
			
			describe('if the state is a file', function() {
				
				beforeEach(function() {
					setAddress( 'hello world.txt' );
					waitForPseudositer( $elem );
				});
				
				it('should not display the link to the file', function() {
					runs(function() {
						expect($('#pseudositer')).not.toContain('a[href="/hello world"]');
					});
				});
				
				it('should display all the links in directories containing that file', function() {
					runs(function() {
						expect($('#pseudositer')).toContain('a[href="/directory/"]');
						expect($('#pseudositer')).toContain('a[href="/tree"]');
					});
				});
				
				describe('including the file type', function() {
					
					beforeEach(function() {
						setAddress( 'hello world.txt' );
						waitForPseudositer( $elem );
					});
					
					it('should strip the file type from the state', function() {
						runs(function() {
							expect(document.location.pathname).toEqual('/hello world');
						});
					});
				});
				
				describe('not including the file type', function() {
					
					beforeEach(function() {
						setAddress('hello world');
						waitForPseudositer( $elem );
					});

					it('should leave the state alone', function() {
						runs(function() {
							expect(document.location.pathname).toEqual('/hello world');
						});
					});
				});

				describe('which is a text file', function() {
					
					beforeEach(function() {
						setAddress( 'hello world' );
						waitForPseudositer( $elem );
					});

					it('should load the text file content', function() {
						runs(function() {
							expect($('#pseudositer-content')).toHaveText('Hello World!');
						});
					});
					
				});

				describe('which is an image', function() {

					beforeEach(function() {
						setAddress( 'tree.png' );
						waitForPseudositer( $elem );
					});
					
					it('should create the image element', function() {
						runs(function() {
							expect($('#pseudositer-content')).toHave('img');
							expect($('#pseudositer-content img')).toHaveAttr('src', '/simple/tree.png');
						});
					});

					it('should link to the original image', function() {
						runs(function() {
							expect($('#pseudositer-content')).toHave('a[href="/simple/tree.png"]');
						});
					});
				});
			});
			
			
			describe('if the state is garbage', function() {
				
				var garbage = '/lkjsdiJBNC/sldkj VU&C*J##d';

				beforeEach(function() {
					setAddress( garbage );
					waitForPseudositer( $elem );
				});
				
				it('should display a "content not found" notice', function() {
					runs(function() {
						expect($('#pseudositer-content')).toHaveText('not found');
					});
				});

				it('should not modify the state', function() {
					runs(function() {
						expect(document.location.pathname).toEqual(garbage);
					});
				});
			});
					
		});
		
		describe('if there was previously content on the page', function() {

			beforeEach(function() {
				setAddress( 'hello world.txt' );
				waitForPseudositer( $elem );
				setAddress( 'directory/first.txt' );
				waitForPseudositer( $elem );
			});

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
