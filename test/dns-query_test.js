"use strict";
var dns = require('native-dns');
var client = require('./client');
var server = require('../src/server');

const DNS_PORT = 53;
const API_PORT = 5300;
const ZONE_ROOT = 'xob.useraddress.net';

function query(questionOptions, callback) {
  var question = dns.Question(questionOptions);
  var answers = [];

  var req = dns.Request({
    question: question,
    server: { address: '127.0.0.1', port: DNS_PORT, type: 'udp' },
    timeout: 5000,
  });

  req.on('timeout', function () {
    callback(new Error('Timeout in making request'));
  });

  req.on('message', function (err, answer) {
    answers.push(answer);
  });

  req.on('end', function (err) {
    callback(null, answers);
  });

  req.send();
}


function setAndQuery() {
  var promiseCallbacks = [];

  promiseCallbacks.push(new Promise(function(resolve, reject) {
      var testValue = '123.123.42.42';
      client.set('test/fixtures/certs/', 'localhost', API_PORT,
          '1fa576050d8b3710e57a2d62e84f6781504caf7e.xob.useraddress.net', {
            type: 'A',
            value: testValue
          }, function(err, response) {
            query({
              name: '1fa576050d8b3710e57a2d62e84f6781504caf7e.xob.useraddress.net',
              type: 'A',
            }, function(err, answers) {
              if(err === null && answers[0].answer[0].address === testValue) {
                console.log('PASS');
                resolve();
              } else {
                console.log('FAIL', answers[0]);
                reject();
              }
            });
          });
  }));

  promiseCallbacks.push(new Promise(function(resolve, reject) {
      var testName = "name"
      client.set('test/fixtures/certs/', 'localhost', API_PORT,
          '1fa576050d8b3710e57a2d62e84f6781504caf7e.xob.useraddress.net', {
            type: 'CNAME',
            value: testName
          }, function(err, response) {
            query({
              name: '1fa576050d8b3710e57a2d62e84f6781504caf7e.xob.useraddress.net',
              type: 'CNAME',
            }, function(err, answers) {
              if(err === null && answers[0].answer[0].data === testName) {
                console.log('PASS');
                resolve();
              } else {
                console.log('FAIL', answers[0]);
                reject();
              }
            });
          });
  }));

  return Promise.all(promiseCallbacks);
}

//...
server.serve('test/fixtures/certs/', DNS_PORT, API_PORT, ZONE_ROOT);
setAndQuery().then(() => server.stop());
