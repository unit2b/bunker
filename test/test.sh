#!/bin/sh

set -e
set -u

CURL="curl -sD - -o /dev/null"

rm -f ../content/test/*

$CURL -XPUT --data-binary @usa.png http://alice:alice@localhost:3000/test/usa.png

$CURL http://alice:alice@localhost:3000/test/w:44/usa.png

$CURL http://alice:alice@localhost:3000/test/h:44/usa.png

$CURL http://alice:alice@localhost:3000/test/w:44/h:44/blur:4-4/usa.png

$CURL http://alice:alice@localhost:3000/test/w:44/h:44/blur:4-4/gray:/usa.png

$CURL http://localhost:3000/test/w:44/usa.png

$CURL http://localhost:3000/test/h:44/usa.png

$CURL http://localhost:3000/test/w:44/h:44/blur:4-4/usa.png

$CURL http://localhost:3000/test/w:44/h:44/blur:4-4/gray:/usa.png

