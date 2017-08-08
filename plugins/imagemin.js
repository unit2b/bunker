const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminOptipng = require('imagemin-optipng')
const tempy = require('tempy')
const fs = require('fs-extra')

const plugin = require('../plugin')
const {isImageFile} = require('../utils')

plugin.registerAfterUpload({
  order: 100,
  name: 'imagemin',
  testFn: (ctx) => isImageFile(ctx.file),
  fn: async (ctx) => {
    const dir = await tempy.directoryAsync()
    const rs = await imagemin(
      [ctx.file],
      dir, {
        plugins: [
          imageminMozjpeg(),
          imageminOptipng()
        ]
      }
    )
    if (rs.length === 0) {
      throw new Error('failed to minify image')
    }
    await fs.unlink(ctx.file)
    ctx.file = rs[0].path
  }
})
