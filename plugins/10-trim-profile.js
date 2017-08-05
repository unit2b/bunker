const utils = require('../utils')
const plugin = require('../plugin')

plugin.registerAfterUpload({
  name: 'trimProfile',
  testFn: (ctx) => utils.isImageFile(ctx.file),
  fn: async (ctx) => {
    ctx.file = await utils.runGM(ctx.file, (m) => m.noProfile())
  }
})
