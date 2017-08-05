const path = require('path')

const fs = require('fs-extra')
const gm = require('gm')
const tempy = require('tempy')

const utils = module.exports

utils.matchExtname = (file, ...exts) => {
  return exts.includes(path.extname(file).toLowerCase())
}

utils.isImageFile = (file) => {
  return utils.matchExtname(file, '.jpg', '.jpeg', '.png', '.gif')
}

utils.runGM = (inputFile, fn) => {
  return new Promise((resolve, reject) => {
    const outputFile = tempy.file({extension: path.extname(inputFile)})
    fn(gm(inputFile)).write(outputFile, (err) => {
      if (err) {
        reject(err)
      } else {
        fs.unlink(inputFile, () => resolve(outputFile))
      }
    })
  })
}

utils.log = (...s) => console.log(`${new Date().toLocaleString()}`, ...s)
