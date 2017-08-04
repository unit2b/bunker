const plugin = require('../plugin')

const path = require('path')
const gm = require('gm')
const tempy = require('tempy')
const fs = require('fs-extra')

plugin.registerTransformer({
  name: 'scaleWidth',
  key: 'w',
  testFn: (ctx) => {
    return ['.png', '.jpg'].includes(path.extname(ctx.file).toLowerCase())
  },
  fn: (option, ctx) => {
    return new Promise((resolve, reject) => {
      const inputFile = ctx.file
      const outputFile = tempy.file({extension: path.extname(inputFile)})
      gm(inputFile).resize(parseInt(option)).write(outputFile, (err) => {
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

plugin.registerTransformer({
  name: 'scaleHeight',
  key: 'h',
  testFn: (ctx) => {
    return ['.png', '.jpg'].includes(path.extname(ctx.file).toLowerCase())
  },
  fn: (option, ctx) => {
    return new Promise((resolve, reject) => {
      const inputFile = ctx.file
      const outputFile = tempy.file({extension: path.extname(inputFile)})
      gm(inputFile).resize(null, parseInt(option)).write(outputFile, (err) => {
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
