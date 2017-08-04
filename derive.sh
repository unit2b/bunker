#!/bin/bash

set -e
set -u

curl --head https://$BUNKER_USER:$BUNKER_PASS@$BUNKER_HOST$1
