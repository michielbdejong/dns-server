'use strict';

const https = require('https');
const fs = require('fs');

exports.set = function(certDir, hostname, port, domain, data, callback) {
  var options = {
    hostname,
    port,
    path: '/v1/dns/' + domain.split('.').reverse().join('/'),
    method: 'POST',
    key: fs.readFileSync(certDir + 'privkey.pem'),
    cert: fs.readFileSync(certDir + 'cert.pem'),
    rejectUnauthorized: false
  };
  var calledBack = false;
  var req = https.request(options, (res) => {
    var response = '';
    res.on('data', (d) => {
      response += d;
    });
    res.on('end', () => {
      if (!calledBack) {
        callback(null, response);
        calledBack = true;
      }
    });
  });

  // write data to request body
  req.write(JSON.stringify(data));
  req.end();

  req.on('error', (e) => {
    if (!calledBack) {
      callback(null);
      calledBack = true;
    }
  });
};
