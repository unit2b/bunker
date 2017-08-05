const fs = require('fs')
const path = require('path')

const utils = require('./utils')

const plugin = module.exports = {
  afterUploads: [],
  transformers: []
}

/**
 * registerAfterUpload
 * @param pl, { name: 'trimProfile', testFn: (ctx) => {}, fn: async (ctx) => {}}
 */
plugin.registerAfterUpload = (pl) => {
  for (var i = 0; i < plugin.afterUploads.length; i++) {
    const curr = plugin.afterUploads[i]
    if (curr.order >= pl.order) {
      plugin.afterUploads.splice(i, 0, pl)
      return
    }
  }
  plugin.afterUploads.push(pl)
}

/**
 * registerTransformer
 * @param, pl, { name:'scale', key: 'w', testFn: (ctx) => {}, fn: async (option, ctx) => {}}
 */
plugin.registerTransformer = (pl) => {
  plugin.transformers.push(pl)
}

/**
 * runAfterUpload
 * @param ctx, { file: '/tmp/xxxx.png' }, processor context
 */
plugin.runAfterUpload = async (ctx) => {
  for (let p of plugin.afterUploads) {
    if (p.testFn(ctx)) {
      await p.fn(ctx)
    }
  }
}

/**
 * runTransformer
 * @param list, [{ key: w, option: '10'}], list of transformer options
 * @param ctx, { file: '/tmp/xxxx.png' }, processor context
 */
plugin.runTransformer = async (list, ctx) => {
  for (let m of list) {
    for (let t of plugin.transformers) {
      if (m.key === t.key) {
        if (!t.testFn(ctx)) {
          throw new Error(`transformer ${t.name} not fit`)
        }
        utils.debug('plugin start:', t.name)
        await t.fn(m.option, ctx)
        utils.debug('plugin done:', t.name)
      }
    }
  }
}

// load all plugins
fs.readdir(path.join(__dirname, './plugins'), (err, files) => {
  if (err) throw err
  // load all plugins
  files.sort().forEach(f => {
    if (path.extname(f) === '.js') {
      require('./plugins/' + f)
    }
  })
  // log
  utils.log('loading plugins')
  plugin.afterUploads.forEach(n => utils.log(`plugin: afterUpload ${n.name}`))
  plugin.transformers.forEach(n => utils.log(`plugin: transformer ${n.name} (${n.key})`))
})
