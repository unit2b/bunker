const path = require('path')

module.exports = {
  storage: path.join(__dirname, 'content'),
  port: process.env.PORT || 3000,
  users: [{
    username: 'alice',
    password: 'alice'
  }]
}
