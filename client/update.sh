#!/bin/bash
# Usage: ./update.sh a7427c5ce2175c61a7427c5ce2175c61 192.168.0.42 52.36.71.23
echo "Got called: ./update.sh $1 $2 $3"

echo "Creating DNS records..."

node ./apiCall.js ./certs/ knilxof.org 5300 $1 "{\"type\":\"A\",\"value\":\"$2\"}"
node ./apiCall.js ./certs/ knilxof.org 5300 a.$1 "{\"type\":\"A\",\"value\":\"$2\"}"
node ./apiCall.js ./certs/ knilxof.org 5300 b.$1 "{\"type\":\"A\",\"value\":\"$2\"}"
node ./apiCall.js ./certs/ knilxof.org 5300 remote.$1 "{\"type\":\"A\",\"value\":\"$3\"}"

echo "$1 a.$1 b.$1 remote.$1" > ./domains.txt
echo "Getting SAN cert for: `cat domains.txt`"
./letsencrypt.sh --cron --challenge dns-01 --hook ./deploy-challenge.sh
