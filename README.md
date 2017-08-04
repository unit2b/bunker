# Bunker

Simple file hosting server

## File

### Upload / Update

**Request**

`curl -XPUT --data-binary @cover.jpg https://username:password@bunker.example.com/2017-08-01/cover.jpg`

*This will also remove all versions of that file*

**Response**

`https://bunker.example.com/2017-01-01/cover.jpg`

### Fetch

`curl https://bunker.example.com/2017-08-01/cover.jpg`

## Version

### Create / Fetch

`curl https://bunker.example.com/2017-08-01/w:10/cover.jpg`
