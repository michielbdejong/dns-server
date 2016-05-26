'use strict';

var dnsApiClient = require('./client');

if (process.argv.length < 5) {
  console.error('Example usage: node client/index server/test/fixtures/certs ' +
      '$SERVER 5300 1fa576050d8b3710e57a2d62e84f6781504caf7e.xob.useraddress.net ' +
      '"{type: \'A\', value: \'123.123.123.123\'}"');
  return;
}

var args = process.argv.slice(2);
console.log('Parsing', args[4]);
args[4] = JSON.parse(args[4]);
args.push(function(res) {
  console.log('Result:', res);
});

dnsApiClient.set.apply(dnsApiClient, args);
