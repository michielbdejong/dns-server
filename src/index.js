'use strict';

var server = require('./server');

if (process.argv.length < 5) {
  console.error('Example usage: node src/index.js test/fixtures/certs/ 53 5300 box.knilxof.org');
  return;
}
server.serve.apply(undefined, process.argv.slice(2));
