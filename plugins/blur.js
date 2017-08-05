const utils = require('../utils')
const plugin = require('../plugin')

plugin.registerTransformer({
  name: 'blur',
  key: 'blur',
  testFn: (ctx) => utils.isImageFile(ctx.file),
  fn: async (option, ctx) => {
    const opts = option.split('-').map(e => parseInt(e))
    utils.debug('blur:', opts)
    ctx.file = await utils.runGM(ctx.file, (m) => m.blur(...opts))
  }
})
