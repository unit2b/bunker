const plugin = require('../plugin')

const path = require('path')
const gm = require('gm')
const tempy = require('tempy')
const fs = require('fs-extra')

plugin.afterUpload.push({
  name: 'trimProfile',
  testFn: (ctx) => {
    return ['.png', '.jpg'].includes(path.extname(ctx.file).toLowerCase())
  },
  fn: (ctx) => {
    return new Promise((resolve, reject) => {
      const inputFile = ctx.file
      const outputFile = tempy.file({extension: path.extname(inputFile)})
      gm(inputFile).noProfile().write(outputFile, (err) => {
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
