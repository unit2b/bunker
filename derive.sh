#!/bin/bash

set -e
set -u

curl -sD - -o /dev/null https://$BUNKER_USER:$BUNKER_PASS@$BUNKER_HOST$1

echo ""
echo "-----"
echo "https://$BUNKER_HOST$1"
