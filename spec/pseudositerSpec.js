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
			
			beforeEach(function() {
				runs(function() {
					History.replaceState(null, null, '/hello world');
				});

				waitsFor(function() {
					return function() {
						$('pseudositer-content').text() === "Hello World!";
					};
				}, 'Never loaded "/hello world" content.', 2000);
			});

			it('should remove the loading notice', function() {
				expect($('#pseudositer-loading')).not.toBeVisible();
			});
			
			it('should transition in the content', function() {
				throw 'not yet implemented';
			});
		});
		
		describe('if state is root', function() {

			beforeEach(function() {
				History.replaceState(null, null, '/');
			});

			it('should replace the state with that of the deepest earliest alphabetized content', function() {
				expect(document.location.pathname).toEqual('/directory/first.txt');
			});
		});

		describe('if there is a non-root state', function() {

			describe('if the state is a directory', function() {

				beforeEach(function() {
					History.replaceState(null, null, '/directory/');
				});
				
				it('should display the links of that directory', function() {
					expect($('#pseudositer')).toContain('a[href="/directory/nested"]');
					expect($('#pseudositer')).toContain('a[href="/directory/first"]');
				});
				
				it('should replace the state with that of the deepest earliest alphabetized content', function() {
					expect(document.location.pathname).toEqual('/directory/first');
				});

				it('should load the deepest earliest alphabetized content in that directory', function() {
					expect($('#pseudositer-content')).toHaveText('first blood');
				});
			});
			
			describe('if the state is a file', function() {
				
				beforeEach(function() {
					History.replaceState(null, null, '/hello world.txt');
				});
				
				it('should not display the link to the file', function() {
					expect($('#pseudositer')).not.toContain('a[href="/hello world"]');
				});
				
				it('should display all the links in directories containing that file', function() {
					expect($('#pseudositer')).toContain('a[href="/directory/"]');
					expect($('#pseudositer')).toContain('a[href="/tree"]');
				});
				
				describe('including the file type', function() {
					
					beforeEach(function() {
						History.replaceState(null, null, '/hello world.txt');
					});
					
					it('should strip the file type from the state', function() {
						expect(document.location.pathname).toEqual('/hello world');
					});
				});
				
				describe('not including the file type', function() {
					
					beforeEach(function() {
						History.replaceState(null, null, '/hello world');
					});

					it('should leave the state alone', function() {
						expect(document.location.pathname).toEqual('/hello world');
					});
				});

				describe('which is a text file', function() {
					
					beforeEach(function() {
						History.replaceState(null, null, '/hello world');
					});

					it('should load the text file content', function() {
						expect($('#pseudositer-content')).toHaveText('Hello World!'));
					});
					
				});

				describe('which is an image', function() {

					beforeEach(function() {
						History.replaceState(null, null, '/tree');
					});
					
					it('should load the image', function() {
						expect($('#pseudositer-content')).toHave('img');
						expect($('#pseudositer-content img')).toHaveAttr('src', '/simple/tree.png');
					});
				});
			});
			
			
			describe('if the state is garbage', function() {
				
				var garbage = '/lkjsdiJBNC/sldkj VU&C*J##d';

				beforeEach(function() {
					History.replaceState(null, null, garbage);

				});
				
				it('should display a "content not found" notice', function() {
					expect($('#pseudositer-content')).toHaveText('not found');
				});

				it('should not modify the state', function() {
					expect(document.location.pathname).toEqual(garbage);
				});
			});
					
		});
		
		describe('if there was previously content on the page', function() {

			beforeEach(function() {
				runs(function() {
					History.replaceState(null, null, '/hello world');
				});
				
				waitsFor(function() {
					return function() {
						$('pseudositer-content').text() === "Hello World!";
					};
				}, 'Never loaded "/hello world" content.', 2000);

				runs(function() {
					History.replaceState(null, null, '/directory/first');
				});
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