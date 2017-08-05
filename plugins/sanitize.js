const utils = require('../utils')
const plugin = require('../plugin')

plugin.registerAfterUpload({
  order: 0,
  name: 'sanitize',
  testFn: (ctx) => utils.isImageFile(ctx.file),
  fn: async (ctx) => {
    ctx.file = await utils.runGM(ctx.file, (m) => m.noProfile())
  }
})
