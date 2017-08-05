#!/bin/sh

set -e
set -u

rm -f ../content/test/*

curl -XPUT --data-binary @usa.png http://alice:alice@localhost:3000/test/usa.png

curl http://alice:alice@localhost:3000/test/w:44/usa.png > /dev/null

curl http://alice:alice@localhost:3000/test/h:44/usa.png > /dev/null

curl http://alice:alice@localhost:3000/test/w:44/h:44/blur:4-4/usa.png > /dev/null

curl http://localhost:3000/test/w:44/usa.png > /dev/null

curl http://localhost:3000/test/h:44/usa.png > /dev/null

curl http://localhost:3000/test/w:44/h:44/blur:4-4/usa.png > /dev/null
