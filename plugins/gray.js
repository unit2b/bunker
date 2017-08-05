const utils = require('../utils')
const plugin = require('../plugin')

plugin.registerTransformer({
  name: 'gray',
  key: 'gray',
  testFn: (ctx) => utils.isImageFile(ctx.file),
  fn: async (option, ctx) => {
    ctx.file = await utils.runGM(ctx.file, (m) => m.colorspace('gray'))
  }
})
