describe('pseudopath "fixtures/simple/"', function() {
	var pseudoPath = 'fixtures/simple/';

    describe('when the page is reloaded', function() {

		it('should trigger startUpdate event', function() {
			runs(function() {
				spyOnEvent($pseudo, 'startUpdate.pseudositer');
				$pseudo.pseudositer( pseudoPath );
			});
			waitsForEvent($pseudo, 'startUpdate.pseudositer', 1000);
			runs(function() {
				expect('startUpdate.pseudositer').toHaveBeenTriggeredOn($pseudo);
			});
		});

		it('should trigger startLoading event', function() {
			runs(function() {
				spyOnEvent($pseudo, 'startLoading.pseudositer');
				$pseudo.pseudositer( pseudoPath );
			});
			waitsForEvent($pseudo, 'startLoading.pseudositer', 1000);
			runs(function() {
				expect('startLoading.pseudositer').toHaveBeenTriggeredOn($pseudo);
			});
		});
		
		describe('if the pseudoPath is relative with ".."', function() {

			describe('if recursion is false', function() {

				it('should still find links', function() {
					runs(function() {
						$pseudo.pseudositer( '../pseudositer/' + pseudoPath, { recursion: false } );
					});
					waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
					runs(function() {
						expect($pseudo.find('.pseudositer-index-0')).toContain('a[href="#/directory/"]');
						expect($pseudo.find('.pseudositer-index-0')).toContain('a[href="#/hello%20world.txt"]');
						expect($pseudo.find('.pseudositer-index-0')).toContain('a[href="#/tree.png"]');
					});
				});
			});

			describe('if recursion is true', function() {

				it('should still find content', function() {
					runs(function() {
						$pseudo.pseudositer( '../pseudositer/' + pseudoPath, { recursion : true } );
					});
					waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
					runs(function() {
						expect($pseudo.find('.pseudositer-content')).toHaveText(/first blood/);
					});
				});
			});
		});
		
		describe('if the pseudoPath is absolute', function() {
			describe('if recursion is false', function() {

				it('should still find links', function() {
					runs(function() {
						$pseudo.pseudositer( getRealPath( pseudoPath ), { recursion : false } );
					});
					waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
					runs(function() {
						expect($pseudo.find('.pseudositer-index-0')).toContain('a[href="#/directory/"]');
						expect($pseudo.find('.pseudositer-index-0')).toContain('a[href="#/hello%20world.txt"]');
						expect($pseudo.find('.pseudositer-index-0')).toContain('a[href="#/tree.png"]');
					});
				});
			});

			describe('if recursion is true', function() {

				it('should still find content', function() {
					runs(function() {
						$pseudo.pseudositer( getRealPath( pseudoPath ), { recursion : true } );
					});
					waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
					runs(function() {
						expect($pseudo.find('.pseudositer-content')).toHaveText(/first blood/);
					});
				});
			});
		});
		
		describe('when the content is finished loading', function() {

			it('should trigger doneLoading event', function() {
				runs(function() {
					spyOnEvent($pseudo, 'doneLoading.pseudositer');
					document.location.hash = "/hello world.txt";
					$pseudo.pseudositer( pseudoPath );
				});
				waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
				runs(function() {
					expect('doneLoading.pseudositer').toHaveBeenTriggeredOn($pseudo);
				});
			});

			it('should transition in the content', function() {
				runs(function() {
					document.location.hash = "/hello world.txt";
					$pseudo.pseudositer( pseudoPath );
				});
				waitsForEvent( $pseudo, 'hideContent.pseudositer', 1000 );
				runs(function() {
					console.log($pseudo.find('.pseudositer-content') );
					//expect( $pseudo.find('.pseudositer-content') ).toBeEmpty();
					//expect( $pseudo.find('.pseudositer-content').children() ).not.toBeVisible();
				});
				waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
				runs(function() {
					console.log( $pseudo.find('.pseudositer-content').children().css( 'opacity' )  );
					expect( $pseudo.find('.pseudositer-content').children().css( 'opacity' ) ).toBe('1');
				});
			});			
		});

		describe('if fragment is root', function() {

			describe('if recursion is true', function() {
				it('should replace the fragment with that of the deepest earliest alphabetized content', function() {
					runs(function() {
						$pseudo.pseudositer( pseudoPath, { recursion: true } );
					});
					waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
					runs(function() {
						expect(document.location.hash).toEqual('#/directory/first.txt');
					});
				});
			});
		});

		describe('if there is a non-root fragment', function() {

			describe('if the fragment does not start with a slash', function() {
				it('should insert a slash before the fragment', function() {
					runs(function() {
						document.location.hash = "hello world.txt";
						$pseudo.pseudositer( pseudoPath );
					});
					waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
					runs(function() {
						expect( document.location.hash ).toEqual('#/hello world.txt');
					});
				});
			});

			describe('if the fragment is a directory', function() {

				describe('if recursion is false', function() {
					it('should display the links of that directory', function() {
						runs(function() {
							document.location.hash = "/directory/";
							$pseudo.pseudositer( pseudoPath, { recursion : false } );
						});
						waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
						runs(function() {
							expect($pseudo.children()).toContain('a[href="#/directory/nested.txt"]');
							expect($pseudo.children()).toContain('a[href="#/directory/first.txt"]');
						});
					});
				});
				
				describe('if recursion is true', function() {
					it('should replace the fragment with that of the deepest earliest alphabetized content', function() {
						runs(function() {
							document.location.hash = "/directory/";
							$pseudo.pseudositer( pseudoPath, { recursion: true } );
						});
						waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
						runs(function() {
							expect(document.location.hash).toEqual('#/directory/first.txt');
						});
					});
					
					it('should load the deepest earliest alphabetized content in that directory', function() {
						runs(function() {
							document.location.hash = "/directory/";
							$pseudo.pseudositer( pseudoPath, { recursion: true } );
						});
						waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
						runs(function() {
							expect( $pseudo.find('.pseudositer-content').children() ).toHaveText( /first blood/ );
						});
					});
				});
			});
			
			describe('if the fragment is a file', function() {
				
				it('should display all the links in directories containing that file', function() {
					runs(function() {
						document.location.hash = "/hello world.txt";
						$pseudo.pseudositer( pseudoPath );
					});
					waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
					runs(function() {
						expect( $pseudo.find('.pseudositer-index-0')).toContain('a[href="#/directory/"]');
						expect( $pseudo.find('.pseudositer-index-0')).toContain('a[href="#/tree.png"]');
					});
				});
				

				describe('including the file type', function() {
					// not currently implemented
					xit('should strip the file type from the fragment', function() {
						runs(function() {
							document.location.hash = "/hello world.txt";
							$pseudo.pseudositer( pseudoPath );
						});
						waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
						runs(function() {
							expect(document.location.hash).toEqual('#/hello world');
						});
					});
				});
				
				xdescribe('not including the file type', function() {

					it('should leave the fragment alone', function() {
						runs(function() {
							document.location.hash = "/hello world";
							$pseudo.pseudositer( pseudoPath );
						});
						waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
						runs(function() {
							expect(document.location.hash).toEqual('#/hello world');
						});
					});
				});

				describe('which is a text file', function() {
					
					it('should load the text file content', function() {
						runs(function() {
							document.location.hash = "/hello world.txt";
							$pseudo.pseudositer( pseudoPath );
						});
						waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
						runs(function() {
							expect( $pseudo.find('.pseudositer-content').children() ).toHaveText(/Hello World!/);
						});
					});
					
				});

				describe('which is an image', function() {

					it('should create the image element', function() {
						runs(function() {
							document.location.hash = "/tree.png";
							$pseudo.pseudositer( pseudoPath );
						});
						waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
						runs(function() {
							expect( $pseudo.find('.pseudositer-content')).toContain('img');
							expect( $pseudo.find('.pseudositer-content * img')).toHaveAttr('src', getRealPath( pseudoPath ) + 'tree.png');
						});
					});

					it('should link to the original image', function() {
						runs(function() {
							document.location.hash = "/tree.png";
							$pseudo.pseudositer( pseudoPath );
						});
						waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
						runs(function() {
							expect( $pseudo.find('.pseudositer-content')).toContain('a[href="'+ getRealPath( pseudoPath ) + 'tree.png"]');
						});
					});
				});
			});  // if the fragment is a file
			
			
			xdescribe('if the fragment is garbage', function() {
				
				var garbage = '/lkjsdiJBNC/sldkj VU&C*J##d';
				
				it('should display an error notice', function() {
					runs(function() {
						document.location.hash = garbage;
						$pseudo.pseudositer( pseudoPath );
					});
					waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
					runs(function() {
						expect($pseudo).toContain('.pseudositer-error');
					});
				});

				it('should not modify the fragment', function() {
					runs(function() {
						document.location.hash = garbage;
						$pseudo.pseudositer( pseudoPath );
					});
					waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
					runs(function() {
						expect(document.location.hash).toEqual('#' + garbage);
					});
				});
			});
					
		});
		

		describe('if the fragment has been visited before', function() {
			it('should not load the content again', function() {
				runs(function() {
					document.location.hash = '/directory/first.txt';
					$pseudo.pseudositer( pseudoPath );
				});
				waitsForEvent($pseudo, 'doneUpdate.pseudositer', 1000);
				runs(function() {
					document.location.hash = 'directory/nested.txt';
				});
				waitsForEvent($pseudo, 'doneUpdate.pseudositer', 1000);
				runs(function() {
					spyOnEvent( $pseudo, 'startLoading' );
					spyOnEvent( $pseudo, 'doneLoading' );
					document.location.hash = '/directory/first.txt';
				});
				waitsForEvent($pseudo, 'doneUpdate.pseudositer', 1000);
				runs(function() {
					expect( 'startLoading' ).not.toHaveBeenTriggeredOn( $pseudo );
					expect( 'doneLoading' ).not.toHaveBeenTriggeredOn( $pseudo );
				});
				
			});
		});
    }); // when the page is reloaded

	describe( 'when the value for recursion is changed', function() {

		it('immediately updates the page', function() {
			runs(function() {
				$pseudo.pseudositer( pseudoPath, { recursion : false } );
			});
			waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
			runs(function() {
				spyOnEvent( $pseudo, 'startUpdate.pseudositer' );
				$pseudo.data( 'pseudositer' ).setRecursion( true );
			});
			waitsForEvent($pseudo, 'doneUpdate.pseudositer', 5000);
			runs(function() {
				expect( 'startUpdate.pseudositer' ).toHaveBeenTriggeredOn( $pseudo );
			});
		});

		describe('when recursion is set to be true', function() {

			it('shows recursed content', function() {
				runs(function() {
					$pseudo.pseudositer( pseudoPath, { recursion : false } );
				});
				waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
				runs( function() {
					$pseudo.data( 'pseudositer' ).setRecursion( true );
				});
				waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 5000 );
				runs( function() {
					expect( document.location.hash ).toEqual( '#/directory/first.txt' );
					expect( $pseudo.find('.pseudositer-content').children() ).toHaveText(/first blood/i);
				});
			});

		});

		describe('when recursion is set to be false', function() {

			it('does not recurse upon new navigation', function() {
				runs(function() {
					$pseudo.pseudositer( pseudoPath, { recursion : true } );
				});
				waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
				runs( function() {
					$pseudo.data( 'pseudositer' ).setRecursion( false );
					document.location.hash = '/';
				});
				waitsForEvent( $pseudo, 'doneUpdate.pseudositer', 1000 );
				runs( function() {
					expect( document.location.hash ).toEqual( '#/' );
					expect( $pseudo.find('.pseudositer-content') ).toBeEmpty();
				});
			});

		});

		describe('when recursion is set to a non boolean value', function() {

			it('throws an exception', function() {
				runs(function() {
					$pseudo.pseudositer( pseudoPath );
					expect(function() { $pseudo.data( 'pseudositer' ).setRecursion( {} ) } ).toThrow();
				});
			});

		});
	});
});
