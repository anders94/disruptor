var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();

var debug = false; // prints the time once a second so you can see when this is running

process.on('message', function(m) {
        //console.log('child process: counting "' + m + '"');
	var total = 0, unique = 0;
	var hash = {};
	var ary = tokenizer.tokenize(m);
	for (var id in ary) { // throw stemmed word into hash
	    // a stemmer removes endings like pluralization and 'ing'
	    hash[natural.PorterStemmer.stem(ary[id])] = true;
	    total ++;
	}

	for (var key in hash) // count unique word stems
	    unique ++;

        process.send({ message: m, total: total, unique: unique });
    });

console.log('wordcount started');

if (debug)
    setInterval( function() {
	    console.log('wordcount running '+Date.now());
	}, 1000);
