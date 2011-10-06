describe('pseudositer', function() {

	/**
	 * Load fixtures.
	 **/
	beforeEach(function() {
		runs(function() {
			// simulate having the hashpath there before the page loads
			setFragment(getPreloadFragment());

			setFixtures( $( '<div />' ).attr( 'id', 'pseudositer' ) );
			$elem = $('#pseudositer').pseudositer( 'fixtures/simple/' );
		});
	});

	afterEach(function() {
		runs(function() {
			$elem.data('pseudositer').destroy();
		});
	});
	
    describe('when the page is reloaded', function() {

		it('should throw up a loading notice', function() {
			runs(function() {
				expect($('.pseudositer-load')).toBeVisible();
			});
		});
		
		describe('when the content is finished loading', function() {

			it('should remove the loading notice', function() {
				waitForPseudositer( $elem );
				runs(function() {
					expect($('.pseudositer-load')).not.toBeVisible();
				});
			});
			
			it('should transition in the content', function() {
				throw 'not yet implemented';
			});
		});
		
		describe('if state is root', function() {

			it('should replace the state with that of the deepest earliest alphabetized content', function() {
				waitForPseudositer( $elem );
				runs(function() {
					expect(document.location.hash).toEqual('#/directory/first.txt');
				});
			});
		});

		describe('if there is a non-root state', function() {

			describe('if the state is a directory', function() {

				beforeEach(function() {
					setPreloadFragment('/directory/');
				});
				
				it('should display the links of that directory', function() {
					waitForPseudositer( $elem );
					runs(function() {
						expect($elem).toContain('a[href="#/directory/nested"]');
						expect($elem).toContain('a[href="#/directory/first"]');
					});
				});
				
				it('should replace the state with that of the deepest earliest alphabetized content', function() {
					waitForPseudositer( $elem );
					runs(function() {
						expect(document.location.hash).toEqual('#/directory/first');
					});
				});

				it('should load the deepest earliest alphabetized content in that directory', function() {
					waitForPseudositer( $elem );
					runs(function() {
						expect($('.pseudositer-content')).toHaveText('first blood');
					});
				});
			});
			
			describe('if the state is a file', function() {
				
				beforeEach(function() {
					setPreloadFragment( '/hello world.txt' );
				});
				
				it('should not display the link to the file', function() {
					waitForPseudositer( $elem );
					runs(function() {
						expect($elem).not.toContain('a[href="#/hello world"]');
					});
				});
				
				it('should display all the links in directories containing that file', function() {
					waitForPseudositer( $elem );
					runs(function() {
						expect($elem).toContain('a[href="#/directory/"]');
						expect($elem).toContain('a[href="#/tree"]');
					});
				});
				
				describe('including the file type', function() {
					
					it('should strip the file type from the state', function() {
						waitForPseudositer( $elem );
						runs(function() {
							expect(document.location.hash).toEqual('#/hello world');
						});
					});
				});
				
				describe('not including the file type', function() {
					
					beforeEach(function() {
						setPreloadFragment('/hello world');
					});

					it('should leave the state alone', function() {
						waitForPseudositer( $elem );
						runs(function() {
							expect(document.location.hash).toEqual('#/hello world');
						});
					});
				});

				describe('which is a text file', function() {
					
					beforeEach(function() {
						setPreloadFragment('/hello world.txt');
					});

					it('should load the text file content', function() {
						waitForPseudositer( $elem );
						runs(function() {
							expect($('#pseudositer-content')).toHaveText('Hello World!');
						});
					});
					
				});

				describe('which is an image', function() {

					beforeEach(function() {
						setPreloadFragment('/tree.png');
					});
					
					it('should create the image element', function() {
						waitForPseudositer( $elem );
						runs(function() {
							expect($('#pseudositer-content')).toContain('img');
							expect($('#pseudositer-content * img')).toHaveAttr('src', '/simple/tree.png');
						});
					});

					it('should link to the original image', function() {
						waitForPseudositer( $elem );
						runs(function() {
							expect($('#pseudositer-content')).toContain('a[href="/simple/tree.png"]');
						});
					});
				});
			});
			
			
			describe('if the state is garbage', function() {
				
				var garbage = '/lkjsdiJBNC/sldkj VU&C*J##d';

				beforeEach(function() {
					setPreloadFragment(garbage);
				});
				
				it('should display a "content not found" notice', function() {
					waitForPseudositer( $elem );
					runs(function() {
						expect($('#pseudositer-content')).toHaveText('not found');
					});
				});

				it('should not modify the state', function() {
					waitForPseudositer( $elem );
					runs(function() {
						expect(document.location.hash).toEqual('#' + garbage);
					});
				});
			});
					
		});
		
		describe('if there was previously content on the page', function() {

			beforeEach(function() {
				setPreloadFragment( '/hello world.txt' );
				// waitForPseudositer( $elem );
				// setAddress( 'directory/first.txt' );
				// waitForPseudositer( $elem );
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
