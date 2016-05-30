# pagekite-letsencrypt
Server that helps the Box to announce its local IP address without relying on mDNS, and to register its LetsEncrypt cert for use on its local IP address.

## Architecture

````
localhost:8000   ----   proxy.js   ----  pagekite.py (backend)  ----  pagekite.py (frontend)  ----  browser
                              \  \                                                                /  /
                               \   ----  DNS api  ----  DNS server  -----------------------------   /
                                \                             /                                    /
                                  ----  LetsEncrypt API  ----    (-  -  -  -)   LetsEncrypt trust
````

## Usage
Run the server:
````bash
docker build -t pagekite-letsencrypt server/
docker run -d --net=host pagekite-letsencrypt
````

Run the client:
````bash
cd client/
wget https://raw.githubusercontent.com/lukas2511/letsencrypt.sh/master/letsencrypt.sh
python -m SimpleHTTPServer 8000
node proxy.js
````


Add a few records:
````bash
SERVER=127.0.0.1
# On Mac OSX:
# SERVER=192.168.99.100
node client/index server/test/fixtures/certs/ $SERVER 5300 \
  1fa576050d8b3710e57a2d62e84f6781504caf7e.box.knilxof.org \
  "{\"type\": \"A\", \"value\": \"123.123.123.123\"}"
node client/index server/test/fixtures/certs/ $SERVER 5300 \
  _acme-challenge.1fa576050d8b3710e57a2d62e84f6781504caf7e.box.knilxof.org \
  "{\"type\": \"TXT\", \"value\": \"deadbeef\"}"
````

Query them:
````bash
dig A 1fa576050d8b3710e57a2d62e84f6781504caf7e.box.knilxof.org @$SERVER
dig TXT _acme-challenge.1fa576050d8b3710e57a2d62e84f6781504caf7e.box.knilxof.org @$SERVER
````

Run the tests:
````bash
cd server
npm install
jshint *.js
jscs *.js
sudo node test/dns-query_test.js
cd ..
````
