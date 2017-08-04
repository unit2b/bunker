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
  return {
    httpPath: path.join(...components),
    modifiers: modifiers
  }
}

function modifiersToDigest (modifiers) {
  var str = VER_SUFFIX
  modifiers.forEach(({key, option}) => {
    str += key
    str += '_'
    str += option
    str += '_'
  })
  return str
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
    const {modifiers, httpPath} = decomposePath(ctx.path)
    const fullPath = path.join(storage, httpPath)
    const ext = path.extname(httpPath)

    if (ctx.method === 'GET') {
      if (ctx.path === '/') {
        ctx.body = 'YoRHa Bunker System by Unit.2B\n\nhttps://github.com/unit2b/bunker'
        return
      }
      if (modifiers.length === 0) {
        // serve the static file
        if (!await sendFile(ctx, storage, httpPath)) {
          await next()
        }
      } else {
        // original file
        // check original file exists
        if (!await fs.pathExists(fullPath)) {
          ctx.throw(404)
        }
        // versioned file
        const suffix = modifiersToDigest(modifiers)
        const suffixedPath = path.join(
          path.dirname(httpPath),
          path.basename(httpPath, ext) + suffix + ext
        )
        const suffixedFullPath = path.join(storage, suffixedPath)
        // check version exists
        if (!await fs.pathExists(suffixedFullPath)) {
          // copy tempFile
          const tempFile = tempy.file({extension: ext})
          await fs.copy(fullPath, tempFile, {overwrite: true})
          const pCtx = {
            file: tempFile
          }
          await plugin.runTransformer(modifiers, pCtx)
          await fs.move(pCtx.file, suffixedFullPath, {overwrite: true})
          if (!await sendFile(ctx, storage, suffixedPath)) {
            ctx.throw(500, 'fialed to create version')
          }
        } else {
          if (!await sendFile(ctx, storage, suffixedPath)) {
            await next()
          }
        }
      }
    } else if (ctx.method === 'PUT') {
      // validate the authentication
      validateAuth(ctx, users)
      // upload the file
      const tempFile = tempy.file({extension: ext})
      await fs.ensureDir(path.dirname(tempFile))
      await promisePipe(ctx.req, fs.createWriteStream(tempFile))
      // execute the afterUpload plugins
      const pCtx = {
        file: tempFile
      }
      await plugin.runAfterUpload(pCtx)
      // move file to fullPath
      await fs.move(pCtx.file, fullPath, {overwrite: true})
      // delete versions
      const dirname = path.dirname(fullPath)
      const basename = path.basename(fullPath, ext)
      const list = await fs.readdir(dirname)
      for (var i = 0; i < list.length; i++) {
        const n = list[i]
        if (n.startsWith(basename + VER_SUFFIX)) {
          try {
            await fs.unlink(path.join(dirname, n))
          } catch (e) {
            console.log(`failed to delete ${n}`)
          }
        }
      }
      ctx.status = 200
      ctx.body = 'OK'
    }
  }
}
