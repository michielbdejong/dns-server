#!/bin/bash
# Usage: ./update.sh ns.useraddress.net box.useraddress.net auth.useraddress.net a7427c5ce2175c61a7427c5ce2175c61 192.168.0.42 52.36.71.23

echo "Got called: ./update.sh $1 $2 $3 $4 $5 $6"

SERVER=$1
DOMAIN=$2
PREFIX1=/v1/dns
PREFIX2=`echo $2 | perl -lpe '$_ = join "/", reverse split /\./'`
PREFIX3=`echo $3 | perl -lpe '$_ = join "/", reverse split /\./'`
HASH=$4
LOCAL=$5
REMOTE=$6

# Used by pagekite backend as well as by LetsEncrypt.sh deploy-hook:
echo "$SERVER" > ./server.txt
echo "$HASH.$DOMAIN a.$HASH.$DOMAIN b.$HASH.$DOMAIN remote.$HASH.$DOMAIN" > ./domains.txt

echo "Creating DNS records..."

node ./apiCall.js $SERVER 5300 $PREFIX1/$PREFIX2/$HASH "{\"type\":\"A\",\"value\":\"$LOCAL\"}"
node ./apiCall.js $SERVER 5300 $PREFIX1/$PREFIX2/$HASH/a "{\"type\":\"A\",\"value\":\"$LOCAL\"}"
node ./apiCall.js $SERVER 5300 $PREFIX1/$PREFIX2/$HASH/b "{\"type\":\"A\",\"value\":\"$LOCAL\"}"
node ./apiCall.js $SERVER 5300 $PREFIX1/$PREFIX2/$HASH/remote "{\"type\":\"A\",\"value\":\"$REMOTE\"}"

# Setting pagekite auth, see https://github.com/pagekite/PyPagekite/blob/main/pagekite/pk.py#L1455-L1456:
QUOTA=100
node ./apiCall.js $SERVER 5300 $PREFIX1/$PREFIX3/$PREFIX2/$HASH/remote/https-443/973ed1a3fe410b73ba8ba460d98fda622c1c/tc65f041e7164379701185d5dc503e175d50/d74c635d9b84ce29680a2524f9791349928d "{\"type\":\"A\",\"value\":\"0.0.0.$QUOTA\"}"

# echo "Getting SAN cert for: `cat domains.txt`"
# ./letsencrypt.sh --cron --challenge dns-01 --hook ./deploy-challenge.sh --config ./config.sh
