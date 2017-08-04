#!/bin/bash

set -e
set -u

curl https://$BUNKER_USER:$BUNKER_PASS@$BUNKER_HOST$1 > /dev/null
