const path = require('path')

const tempy = require('tempy')
const fs = require('fs-extra')
const _ = require('lodash')
const koaSend = require('koa-send')
const promisePipe = require('promisepipe')
const basicAuth = require('basic-auth')

const plugin = require('./plugin')

const VER_SUFFIX = '_ver_'

function validateAuth (ctx, users) {
  const auth = basicAuth(ctx)
  // check the auth
  if (auth == null) {
    ctx.throw(403, 'basic auth failed')
  }
  var found = false
  users.forEach(u => {
    if (u.name === auth.name && u.pass === auth.pass) { found = true }
  })
  if (!found) {
    ctx.throw(403, 'basic auth failed')
  }
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
  if (!_.isArray(users)) {
    throw new Error('Flow() "users" not set')
  }
  return async (ctx, next) => {
    const {
      modifiers,
      httpPath,
      basicPath,
      ext
    } = decomposePath(ctx.path)

    if (ctx.method === 'GET') {
      // serve the file
      if (ctx.path === '/') {
        ctx.body = 'YoRHa Bunker System by Unit.2B\n\nhttps://github.com/unit2b/bunker'
      } else {
        if (!await sendFile(ctx, storage, httpPath)) {
          await next()
        }
      }
    } else if (ctx.method === 'HEAD') {
      // check file
      const fullPath = path.join(storage, httpPath)
      const exits = await fs.pathExists(fullPath)
      if (exits) {
        // if exists, just 200
        ctx.status = 200
      } else {
        if (modifiers.length === 0) {
          // if not exists, and no version specified, just next()
          await next()
        } else {
          // else try create a version
          const basicFullPath = path.join(storage, basicPath)
          if (!await fs.pathExists(basicFullPath)) {
            await next()
          } else {
            // validate the authentication
            validateAuth(ctx, users)
            // copy file
            const file = tempy.file({extension: ext})
            await fs.copy(basicFullPath, file, {overwrite: true})
            // run transformers
            const pctx = {file: file}
            await plugin.runTransformer(modifiers, pctx)
            await fs.move(pctx.file, fullPath, {overwrite: true})
            // just 200
            ctx.status = 200
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
      ctx.status = 200
      ctx.body = 'OK'
    }
  }
}
