# dns-server
Server that helps the Box to announce its local IP address without relying on mDNS, and to register its LetsEncrypt cert for use on its local IP address.

## Usage
Run the server:
````bash
docker build -t dns-server .
docker run -d --net=host dns-server
````

Add a few records:
````bash
curl -i -X POST -d "{\"type\":\"TXT\",\"value\":\"hello\"}" \
  http://localhost:5300/v1/dns/org/asdf/bla/192-168-0-42/_acme-challenge
curl -i -X POST -d "{\"type\":\"A\",\"value\":\"192.168.0.42\"}" \
  http://localhost:5300/v1/dns/org/asdf/bla/192-168-0-42
````

NB: On MacOS, Docker runs inside a virtual machine, probably on 192.168.99.100, so you may need to use that instead of 'localhost'.

Query them:
````bash
dig A 192-168-0-42.bla.asdf.org @localhost
dig TXT _acme-challenge.192-168-0-42.bla.asdf.org @localhost
````

Run the tests:
````bash
cd server
npm install
jshint *.js
jscs *.js
mv node_modules ..
cd ..
sudo node test/dns-query_test.js
````
