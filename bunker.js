const path = require('path')

const fs = require('fs-extra')
const _ = require('lodash')
const koaSend = require('koa-send')
const promisePipe = require('promisepipe')

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
          name: s.substring(0, i),
          options: s.substring(i + 1).split(',').filter(s => s.length > 0)
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

async function sendFile (ctx, base, httpPath) {
  var done = false
  try {
    done = await koaSend(ctx, httpPath, {
      root: base,
      maxage: 365 * 24 * 60 * 1000,
      immutable: true
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

    if (ctx.method === 'GET') {
      // serve the static file
      if (!await sendFile(ctx, storage, httpPath)) { await next() }
    } else if (ctx.method === 'PUT') {
      // upload the file
      const fullPath = path.join(storage, httpPath)
      await fs.ensureDir(path.dirname(fullPath))
      await promisePipe(ctx.req, fs.createWriteStream(fullPath))
      ctx.status = 200
      ctx.body = 'OK'
    }
  }
}
