const Koa = require('koa')
const Bunker = require('./bunker')
const config = require('./config')

const app = new Koa()

app.use(Bunker({
  storage: config.storage,
  users: config.users
}))

app.listen(config.port)
