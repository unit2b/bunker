const path = require('path')

const tempy = require('tempy')
const fs = require('fs-extra')
const koaSend = require('koa-send')
const promisePipe = require('promisepipe')
const basicAuth = require('basic-auth')

const plugin = require('./plugin')
const utils = require('./utils')

const VER_SUFFIX = '_ver_'

function validateAuth (ctx, users, code = 403) {
  const auth = basicAuth(ctx)
  if (auth == null) {
    ctx.throw(code)
  }
  for (let u of users) {
    if (u.name === auth.name && u.pass === auth.pass) {
      return
    }
  }
  utils.debug('invalid auth')
  ctx.throw(code)
}

function modifiersToDigest (modifiers) {
  if (modifiers.length === 0) {
    return ''
  }
  var str = VER_SUFFIX
  modifiers.forEach(({key, option}) => {
    str += key
    str += '_'
    str += option
    str += '_'
  })
  return str
}

function decomposePath (httpPath) {
  const modifiers = []
  const components = []
  httpPath
    .split(path.sep)
    .filter(s => s.length > 0 && !s.match(/^\.+$/))
    .forEach(s => {
      var i = s.indexOf(':')
      if (i > 0) {
        modifiers.push({
          key: s.substring(0, i),
          option: s.substring(i + 1)
        })
      } else {
        components.push(s)
      }
    })
  const result = {
    basicPath: path.join(...components),
    ext: path.extname(httpPath),
    modifiers: modifiers
  }
  if (result.modifiers.length === 0) {
    result.httpPath = result.basicPath
  } else {
    result.httpPath = path.join(
      path.dirname(result.basicPath),
      path.basename(result.basicPath, result.ext) +
      modifiersToDigest(result.modifiers) +
      result.ext
    )
  }
  return result
}

async function sendFile (ctx, base, httpPath) {
  var done = false
  try {
    done = await koaSend(ctx, httpPath, {
      root: base,
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=525600, immutable')
      }
    })
  } catch (e) {
    if (e.status !== 404) {
      throw e
    }
  }
  return done
}

module.exports = ({storage, users}) => {
  if (!storage) {
    throw new Error('Flow() "storage" not set')
  }
  if (!Array.isArray(users)) {
    throw new Error('Flow() "users" not set')
  }
  return async (ctx, next) => {
    const {
      modifiers,
      httpPath,
      basicPath,
      ext
    } = decomposePath(ctx.path)
    utils.debug('------------------------')
    utils.debug('modifiers:', modifiers)
    utils.debug('basicPath:', basicPath)
    utils.debug('httpPath:', httpPath)
    utils.debug('ext:', ext)

    if (ctx.method === 'GET') {
      if (!await sendFile(ctx, storage, httpPath)) {
        if (modifiers.length === 0) {
          utils.debug('not found', basicPath)
          await next()
        } else {
          const fullPath = path.join(storage, httpPath)
          // else try create a version
          const basicFullPath = path.join(storage, basicPath)
          if (!await fs.pathExists(basicFullPath)) {
            utils.debug('basic file not found', basicPath)
            await next()
          } else {
            // validate the authentication
            validateAuth(ctx, users, 404)
            // copy file
            const file = tempy.file({extension: ext})
            await fs.copy(basicFullPath, file, {overwrite: true})
            // run transformers
            const pctx = {file: file, originalFile: basicFullPath}
            await plugin.runTransformer(modifiers, pctx)
            await fs.move(pctx.file, fullPath, {overwrite: true})
            if (!await sendFile(ctx, storage, httpPath)) {
              ctx.throw(500)
            }
            utils.log(`versioned: ${httpPath}`)
          }
        }
      }
    } else if (ctx.method === 'PUT') {
      const basicFullPath = path.join(storage, basicPath)
      // validate the authentication
      validateAuth(ctx, users)
      // upload the file
      const file = tempy.file({extension: ext})
      await fs.ensureDir(path.dirname(file))
      await promisePipe(ctx.req, fs.createWriteStream(file))
      // execute the afterUpload plugins
      const pctx = {file: file}
      await plugin.runAfterUpload(pctx)
      // move file to fullPath
      await fs.move(pctx.file, basicFullPath)
      utils.log(` uploaded: ${basicPath}`)
      ctx.status = 200
      ctx.body = 'OK'
    }
  }
}
