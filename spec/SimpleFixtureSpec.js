describe('pseudositer', function() {
	var $elem,
	pseudoPath = 'fixtures/simple/',
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
	
    describe('when the page is reloaded', function() {

		it('should send loading event', function() {
			spyOnEvent($elem, 'loading.pseudositer')
			runs(function() {
				$elem.pseudositer( pseudoPath );
			});
			waitForPseudositer($elem);
			runs(function() {
				expect('loading.pseudositer').toHaveBeenTriggeredOn($elem);
			});
		});
		
		describe('when the content is finished loading', function() {

			it('should send loaded event', function() {
				spyOnEvent($elem, 'loaded.pseudositer')
				runs(function() {
					$elem.pseudositer( pseudoPath );
				});
				waitForPseudositer($elem);
				runs(function() {
					expect('loaded.pseudositer').toHaveBeenTriggeredOn($elem);
				});
			});
			
			it('should transition in the content', function() {
				throw 'not yet implemented';
			});
		});
		
		describe('if state is root', function() {

			it('should replace the state with that of the deepest earliest alphabetized content', function() {
				runs(function() {
					$elem.pseudositer( pseudoPath );
				});
				waitForPseudositer( $elem );
				runs(function() {
					expect(document.location.hash).toEqual('#/directory/first.txt');
				});
			});
		});

		describe('if there is a non-root state', function() {

			describe('if the state is a directory', function() {

				it('should display the links of that directory', function() {
					document.location.hash = "/directory/";
					runs(function() {
						$elem.pseudositer( pseudoPath );
					});
					waitForPseudositer( $elem );
					runs(function() {
						expect($elem.children()).toContain('a[href="#/directory/nested.txt"]');
						expect($elem.children()).toContain('a[href="#/directory/first.txt"]');
					});
				});
				
				it('should replace the state with that of the deepest earliest alphabetized content', function() {
					document.location.hash = "/directory/";
					runs(function() {
						$elem.pseudositer( pseudoPath );
					});
					waitForPseudositer( $elem );
					runs(function() {
						expect(document.location.hash).toEqual('#/directory/first.txt');
					});
				});

				it('should load the deepest earliest alphabetized content in that directory', function() {
					document.location.hash = "/directory/";
					runs(function() {
						$elem.pseudositer( pseudoPath );
					});
					waitForPseudositer( $elem );
					runs(function() {
						expect($('.pseudositer-content')).toHaveText(/first blood/);
					});
				});
			});
			
			describe('if the state is a file', function() {
				
				it('should not display the link to the file', function() {
					document.location.hash = "/hello world.txt";
					runs(function() {
						$elem.pseudositer( pseudoPath );
					});
					waitForPseudositer( $elem );
					runs(function() {
						expect($elem.children()).not.toContain('a[href="#/hello world.txt"]');
					});
				});
				
				it('should display all the links in directories containing that file', function() {
					document.location.hash = "/hello world.txt";
					runs(function() {
						$elem.pseudositer( pseudoPath );
					});
					waitForPseudositer( $elem );
					runs(function() {
						expect($('.pseudositer-index')).toContain('a[href="#/directory/"]');
						expect($('.pseudositer-index')).toContain('a[href="#/tree.png"]');
					});
				});
				
				describe('including the file type', function() {
					// not currently implemented
					xit('should strip the file type from the state', function() {
						document.location.hash = "/hello world.txt";
						runs(function() {
							$elem.pseudositer( pseudoPath );
						});
						waitForPseudositer( $elem );
						runs(function() {
							expect(document.location.hash).toEqual('#/hello world');
						});
					});
				});
				
				xdescribe('not including the file type', function() {

					it('should leave the state alone', function() {
						document.location.hash = "/hello world";

						runs(function() {
							$elem.pseudositer( pseudoPath );
						});
						waitForPseudositer( $elem );
						runs(function() {
							expect(document.location.hash).toEqual('#/hello world');
						});
					});
				});

				describe('which is a text file', function() {
					
					it('should load the text file content', function() {
						document.location.hash = "/hello world.txt";
						runs(function() {
							$elem.pseudositer( pseudoPath );
						});
						waitForPseudositer( $elem );
						runs(function() {
							expect($('.pseudositer-content').children()).toHaveText(/Hello World!/);
						});
					});
					
				});

				describe('which is an image', function() {

					it('should create the image element', function() {
						document.location.hash = "/tree.png";
						runs(function() {
							$elem.pseudositer( pseudoPath );
						});
						waitForPseudositer( $elem );
						runs(function() {
							expect($('.pseudositer-content')).toContain('img');
							expect($('.pseudositer-content * img')).toHaveAttr('src', realPath + 'tree.png');
						});
					});

					it('should link to the original image', function() {
						document.location.hash = "/tree.png";
						runs(function() {
							$elem.pseudositer( pseudoPath );
						});
						waitForPseudositer( $elem );
						runs(function() {
							expect($('.pseudositer-content')).toContain('a[href="'+ realPath + 'tree.png"]');
						});
					});
				});
			});  // if the state is a file
			
			
			describe('if the state is garbage', function() {
				
				var garbage = '/lkjsdiJBNC/sldkj VU&C*J##d';
				
				it('should display a "content not found" notice', function() {
					document.location.hash = garbage;

					runs(function() {
						$elem.pseudositer( pseudoPath );
					});
					waitForPseudositer( $elem );
					runs(function() {
						expect($('#pseudositer-content')).toHaveText(/not found/);
					});
				});

				it('should not modify the state', function() {
					document.location.hash = garbage;
					runs(function() {
						$elem.pseudositer( pseudoPath );
					});
					waitForPseudositer( $elem );
					runs(function() {
						expect(document.location.hash).toEqual('#' + garbage);
					});
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
    }); // when the page is reloaded

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
