const _ = require('lodash')
const fs = require('fs')
const path = require('path')

const plugin = module.exports = {
  afterUpload: []
}

plugin.runAfterUpload = async (ctx) => {
  for (var i = 0; i < plugin.afterUpload.length; i++) {
    const p = plugin.afterUpload[i]
    if (p.testFn(ctx)) {
      console.log('executing plugin:', p.name)
      await p.fn(ctx)
    }
  }
}

// load all plugins
fs.readdir(path.join(__dirname, './plugins'), (err, files) => {
  if (err) throw err
  _.sortBy(files).forEach(f => {
    if (path.extname(f) === '.js') {
      require('./plugins/' + f)
    }
  })
  console.log('plugin:', plugin)
})
