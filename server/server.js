'use strict';

const fs = require('fs');
const dns = require('native-dns');
const dnsCreateServer = dns.createServer;
const https = require('https');
const types = {
  1: 'A',
  5: 'CNAME',
  16: 'TXT'
};
const API_BASE = ['', 'v1', 'dns'];
const RECORD_TTL = 600;

// Special value for A records - if A record is CNAME_REF, then respond with a
// CNAME for the query.
const CNAME_REF = 'CNAME_REF';

function DnsApiServer() {
  this.dnsServer = dnsCreateServer();
  this.apiServer = {};

  this.records = {
    TXT: {},
    A: {},
    CNAME: {},
  };
}

DnsApiServer.prototype.serve = function(certDir, dnsPort, apiPort, zoneRoot, authDomain) {
  const records = this.records;
  const apiRootZone = API_BASE.concat(zoneRoot.split('.').reverse());
  const apiRootAuth = API_BASE.concat((zoneRoot + '.' + authDomain).split('.').reverse());
  this.dnsServer.on('request', function(request, response) {
    var type;
    var host;
    try {
      type = types[request.question[0].type];
      host = request.question[0].name.toLowerCase();
    } catch (e) {
      // Ignore
    }

    if (records[type] &&
        records[type][host]) {
      var data;
      if (records[type][host] === CNAME_REF) {
        type = 'CNAME';
      }

      if (type === 'CNAME') {
        data = records[type][host];
      } else if (type === 'TXT') {
        data = [records[type][host]];
      }
      response.answer.push(dns[type]({
        name: host,
        address: records[type][host], //for A records
        data: data,
        ttl: RECORD_TTL,
      }));
    }
    response.send();
  });

  this.dnsServer.on('error', function(err) {
    console.log(err.stack);
  });

  this.dnsServer.serve(dnsPort);

  this.apiServer = https.createServer({
    key: fs.readFileSync(certDir + '/privkey.pem'),
    cert: fs.readFileSync(certDir + '/cert.pem'),
    ca: fs.readFileSync(certDir + '/chain.pem'),
    requestCert: true,
    rejectUnauthorized: false
  }, function(req, res) {
    let fingerprint;
    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end('Please use POST method');
      return;
    }
    try {
      fingerprint = req.connection.getPeerCertificate().
          fingerprint.split(':').join('').toLowerCase();
    } catch (e) {
      res.writeHead(401);
      res.end('Could not determine fingerprint of your client certificate');
      return;
    }

    var urlParts = req.url.split('/');

    function pathOk(expectedParts) {
      if (urlParts.length < expectedParts.length) {
        return false;
      }
      for (var i = 0; i < expectedParts.length; i++) {
        if (urlParts[i] !== expectedParts[i]) {
          return false;
        }
      }
      return true;
    }

    var expectedUrlPartsAuth = apiRootAuth.concat(fingerprint);
    var expectedUrlPartsZone = apiRootZone.concat(fingerprint);
    if (!pathOk(expectedUrlPartsAuth) && !pathOk(expectedUrlPartsZone)) {
      res.writeHead(401);
      res.end('Please only edit under ' + expectedUrlPartsAuth.join('/') + ' or ' + expectedUrlPartsZone.join('/'));
      return;
    }

    var host = urlParts.splice(3).reverse().join('.');

    var body = '';
    var fields;
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      try {
        fields = JSON.parse(body);
      } catch (e) {
        console.log(body);
        res.writeHead(400);
        res.end('Body should be JSON');
        return;
      }

      if (fields.type === 'CNAME') {
        // Push an A record for the CNAME so that DNS requests for an A respond
        // with a CNAME record.
        records.A[host] = 'CNAME_REF';
      }

console.log('editing', host, fields);
      records[fields.type][host] = fields.value;
      fs.writeFile('./records.json', JSON.stringify(records), function(err) {
        if (err) {
          res.writeHead(500);
        } else {
          res.writeHead(200);
        }
        res.end();
      });
    });
  }).listen(apiPort);
};

DnsApiServer.prototype.stop = function() {
  this.dnsServer.close();
  this.apiServer.close();
};

module.exports = DnsApiServer;
