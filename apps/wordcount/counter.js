var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();

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
