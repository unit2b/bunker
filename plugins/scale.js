const utils = require('../utils')
const plugin = require('../plugin')

plugin.registerTransformer({
  name: 'scaleWidth',
  key: 'w',
  testFn: (ctx) => utils.isImageFile(ctx.file),
  fn: async (option, ctx) => {
    ctx.file = await utils.runGM(ctx.file, (m) => m.resize(parseInt(option)))
  }
})

plugin.registerTransformer({
  name: 'scaleHeight',
  key: 'h',
  testFn: (ctx) => utils.isImageFile(ctx.file),
  fn: async (option, ctx) => {
    ctx.file = await utils.runGM(ctx.file, (m) => m.resize(null, parseInt(option)))
  }
})
