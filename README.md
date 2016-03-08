# dns-server
Server that helps the Box to announce its local IP address without relying on mDNS, and to register its LetsEncrypt cert for use on its local IP address.

## Usage
Run the server:
````bash
npm install
sudo node src/index.js
````

Next steps:
* Retrieve records from disk on startup, and start with root records
* You can only update <hash>.useraddress.net
* Add a secret to QR code URL path

Add a few records:
````bash
curl -i -X POST -d "{\"type\":\"TXT\",\"value\":\"hello\"}" \
  http://localhost:5300/v1/dns/org/asdf/bla/192-168-0-42/_acme-challenge
curl -i -X POST -d "{\"type\":\"A\",\"value\":\"192.168.0.42\"}" \
  http://localhost:5300/v1/dns/org/asdf/bla/192-168-0-42
````

Query them:
````bash
dig A 192-168-0-42.bla.asdf.org @localhost
dig TXT _acme-challenge.192-168-0-42.bla.asdf.org @localhost
````

Run the tests:
````bash
jshint src/
jscs src/
sudo node test/dns-query_test.js
````
