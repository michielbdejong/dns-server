#!/bin/bash

npm install http-proxy
node proxy.js &
python -m SimpleHTTPServer 8000 &
sh scripts/fly.sh
