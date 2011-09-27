all:
	coffee -o lib/pseudositer -c src/*.coffee

clean:
	rm -f lib/pseudositer/*.js
