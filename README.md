# dns-server
Server that helps the Box to announce its local IP address without relying on mDNS, and to register its LetsEncrypt cert for use on its local IP address.

## Usage
Run the server (with DNS on localhost udp port 53 and its API on tcp port 5300):
````bash
cd server
npm install
sudo node index test/fixtures/certs/ 53 5300 box.knilxof.org
````

Run the tests (from the repo root):
````bash
jshint server/*.js server/test/*.js client/*.js client/scripts/*.js
jscs server/*.js server/test/*.js client/*.js client/scripts/*.js
cd server
sudo node test/dns-query_test.js
````

This server cannot be used on localhost, because it requires real-world DNS
resolution. But an instance of it is running on our knilxof.org dev server. To
try it out, run:

````bash
cd client
npm install http-proxy
python -m SimpleHTTPServer 8000 &
node proxy.js
````
