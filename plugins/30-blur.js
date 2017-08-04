const plugin = require('../plugin')

const path = require('path')
const gm = require('gm')
const tempy = require('tempy')
const fs = require('fs-extra')

plugin.registerTransformer({
  name: 'blur',
  key: 'blur',
  testFn: (ctx) => {
    return ['.png', '.jpg'].includes(path.extname(ctx.file).toLowerCase())
  },
  fn: (option, ctx) => {
    return new Promise((resolve, reject) => {
      const inputFile = ctx.file
      const outputFile = tempy.file({extension: path.extname(inputFile)})
      const opts = option.split('-').map(e => parseInt(e))
      gm(inputFile).blur(...opts).write(outputFile, (err) => {
        if (err) {
          reject(err)
        } else {
          // change ctx.file
          ctx.file = outputFile
          // delete old file
          fs.unlink(inputFile, () => {
            // resolve
            resolve(null)
          })
        }
      })
    })
  }
})
