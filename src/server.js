'use strict';

const fs = require('fs');
const dns = require('native-dns');
const dnsServer = dns.createServer();
const https = require('https');
const types = {
  1: 'A',
  16: 'TXT'
};
const API_BASE = ['', 'v1', 'dns'];
const RECORD_TTL = 600;
let records = {
  TXT: {},
  A: {}
};
let apiServer;

exports.serve = function(certDir, dnsPort, apiPort, zoneRoot) {
  const apiRoot = API_BASE.concat(zoneRoot.split('.').reverse());
  dnsServer.on('request', function(request, response) {
    var type, host;
    try {
      type = types[request.question[0].type];
      host = request.question[0].name.toLowerCase();
    } catch (e) {
      // Ignore
    }
    if (records[type] &&
        records[type][host]) {
      response.answer.push(dns[type]({
        name: host,
        address: records[type][host], //for A records
        data: [records[type][host]], //for TXT records
        ttl: RECORD_TTL,
      }));
    }
    response.send();
  });

  dnsServer.on('error', function(err) {
    console.log(err.stack);
  });

  dnsServer.serve(dnsPort);

  apiServer = https.createServer({
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
    var expectedUrlParts = apiRoot.concat(fingerprint);
    var urlParts = req.url.split('/');
    function rejectUrlPath() {
      res.writeHead(401);
      res.end('Please only edit under ' + expectedUrlParts.join('/'));
    }
    if (urlParts.length < expectedUrlParts.length) {
      return rejectUrlPath();
    }
    for (var i = 0; i < expectedUrlParts.length; i++) {
      if (urlParts[i] !== expectedUrlParts[i]) {
        return rejectUrlPath();
      }
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

exports.stop = function() {
  dnsServer.close();
  apiServer.close();
};
