const {
  debug,
  isImageFile,
  runGM
} = require('../utils')
const plugin = require('../plugin')

plugin.registerAfterUpload({
  order: 0,
  name: 'sanitize',
  testFn: (ctx) => isImageFile(ctx.file),
  fn: async (ctx) => {
    debug('no profile')
    ctx.file = await runGM(ctx.file, (m) => m.noProfile())
  }
})
