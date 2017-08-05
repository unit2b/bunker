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
  for (var i = 0; i < plugin.afterUploads.length; i++) {
    const p = plugin.afterUploads[i]
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
  for (var i = 0; i < list.length; i++) {
    const mod = list[i]
    for (var j = 0; j < plugin.transformers.length; j++) {
      const t = plugin.transformers[j]
      if (mod.key === t.key) {
        if (!t.testFn(ctx)) {
          throw new Error(`transformer ${t.name} not fit`)
        }
        await t.fn(mod.option, ctx)
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
