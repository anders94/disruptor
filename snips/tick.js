// notice the order in which these get executed:
//
// bar
// baz
// foo
// hello world

process.nextTick(function() {
	console.log('foo');
    });

console.log('bar');

setTimeout(function() {
	console.log('hello world');
    }, 0);

console.log('baz');
