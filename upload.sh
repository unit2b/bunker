#!/bin/bash

set -e
set -u

curl -XPUT --data-binary @$1 https://$BUNKER_USER:$BUNKER_PASS@$BUNKER_HOST/$2

echo "\n-----"
echo "https://$BUNKER_HOST/$2"
