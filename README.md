# Bunker

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Simple file hosting server

## Installation

* 'NodeJS', latest 8.x series

* 'GraphicsMagick' for image manipulation

## File

### Upload

`curl -XPUT --data-binary @cover.jpg https://username:password@bunker.example.com/2017-08-01/cover.jpg`

### Fetch

`curl https://bunker.example.com/2017-08-01/cover.jpg`

## Version

### Create / Fetch

`curl https://bunker.example.com/2017-08-01/w:10/cover.jpg`
