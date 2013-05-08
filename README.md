disruptor
=========

***Warning: This is alpha code.*** Things are in the design stage so they may change without notice.

<img src="http://anders.com/1offs/disruptor.png" width="400" height="228" alt="disruptor" align="right" />

**disruptor** intends to be a distributed P2P fault-tolerant real-time computation platform written in 
node.js. It has minimal configuration requirements and no single point of failure. Nodes are started 
by being pointed at another peer and they quickly find all the other nodes in the network. JavaScript
compute jobs and json data payloads can be sent to one of the nodes in the network which will distribute
it amongst all the other live nodes. Results are then collated and returned to the requestor. There 
is no master peer, monitoring node or other single point of failure in the system and the design 
stresses simplicity at every turn.

Install
-----
    git clone https://github.com/anders94/disruptor.git

or

    npm install disruptor

Usage
-----
The application takes an IP and port on which to listen and the IP and port of some other peer 
on the network. All the peers will find eachother and stay in communication as peers enter and
leave the network.

    node disruptor peer myHost:myPort anotherHost:anotherPort

Example
-------
In the first shell:

    node disruptor peer 127.0.0.1:1111 127.0.0.1:22222

In the second shell:

    node disruptor peer 127.0.0.1:2222 127.0.0.1:11111

The processes should find eachother. Start a few more and point each to one of the live nodes in 
the network and they should all find eachother.

To see what other nodes the first disruptor peer knows about, visit it with a web browser:

    http://127.0.0.1:1111

Creating Worker Apps
--------------------
Workers run code that lives in app directories under data/ (for example data/wordcount) and 
respond to:

```javascript
process.on('message', function() { ... }) 
```

They emit results with:

```javascript
process.send( ... );
```

For example, here is a word counting worker:

```javascript
var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();

process.on('message', function(m) {
        var total = 0, unique = 0;
        var hash = {};
        var ary = tokenizer.tokenize(m);
        for (var id in ary) { // throw stemmed word into hash
            hash[natural.PorterStemmer.stem(ary[id])] = true;
            total ++;
        }

        for (var key in hash) // count unique word stems
            unique ++;

        process.send({ message: m, total: total, unique: unique });
    });
```

Worker apps, once started, run continuously and can send responses at any time. Any number
of differently named workers can run on the same node at the same time.

Any npm packages used in worker apps needs to be installed on every node. If packages are 
installed locally to the app (ie: data/wordcount/npm_modules as in the above example) they 
will be automatically packeged up with the worker app and distributed to the worker nodes.

**Note: This functionality is under active developed.**

Sending Compute Tasks to Workers
--------------------------------
You can send json payloads to be processed to any node in the cluster through an HTTP socket
connection. The task will be sent to a random worker and responses will flow back the same way.

For example, if you were to send the above wordcount app the following payload:

    'The First World War was to be the war to end all wars.'

the result would look like this:

```json
{
  message: 'The First World War was to be the war to end all wars.',
    total: 13,
   unique: 9
}
```

**Note: This functionality is under active developed.**

Author
------
**Anders Brownworth**

+ [http://twitter.com/anders94](http://twitter.com/anders94)
+ [http://github.com/anders94](http://github.com/anders94)
+ [http://anders.com/](http://anders.com)

Please get in touch if you would like to contribute.

Copyright and license
---------------------
Copyright 2013 Anders Brownworth

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except 
in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

  [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the 
License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either 
express or implied. See the License for the specific language governing permissions and
limitations under the License.
