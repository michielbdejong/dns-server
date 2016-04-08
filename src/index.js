'use strict';

var DnsApiServer = require('./server');

if (process.argv.length < 5) {
  console.error('Example usage: node src/index.js test/fixtures/certs/ 53 5300 box.knilxof.org');
  return;
}

let server = new DnsApiServer();

DnsApiServer.prototype.serve.apply(server, process.argv.slice(2));
