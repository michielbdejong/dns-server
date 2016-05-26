#!/bin/bash

SERVER=192.168.99.100
DOMAIN=1fa576050d8b3710e57a2d62e84f6781504caf7e.box.knilxof.org
SECRET=foxbox

echo kitename = $DOMAIN > ~/.pagekite.rc
echo kitesecret = $SECRET >> ~/.pagekite.rc

pagekite.py --frontend=$SERVER:80 \
    192.168.99.100:8000 https://$SERVER:443
