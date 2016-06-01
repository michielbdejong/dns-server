#!/bin/bash

pagekite.py --isfrontend --ports=80,443 --protos=http,https,websocket --domain=http,https,websocket:*.$DOMAIN --authdomain=$SERVER &

node /app/index.js /app/test/fixtures/certs 53 5300 $DOMAIN
