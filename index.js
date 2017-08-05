const Koa = require('koa')

const utils = require('./utils')
const config = require('./config')

const Bunker = require('./bunker')

const app = new Koa()

app.use(Bunker({
  storage: config.storage,
  users: config.users
}))

app.listen(config.port, () => {
  utils.log(`bunker running at ${config.port}`)
})
