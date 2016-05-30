#!/bin/bash
# URL_PATH=`echo $2 | perl -lpe '$_ = join "/", reverse split /\./'`
node ./apiCall.js ./certs knilxof.org 5300 _acme-challenge.$2 "{\"type\":\"TXT\",\"value\":\"$4\"}"
