import _fs from 'fs-extra'
import _path from 'path'

function loadSymbols(dir) {
  const symbols = []

  const entries = _fs.readdirSync(dir, {
    withFileTypes: true
  })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      symbols.push(...loadSymbols(_path.join(dir, entry.name)))
    } else if (entry.name.endsWith('.svg')) {
      const symbol = _fs
        .readFileSync(_path.join(dir, entry.name))
        .toString()
        .replace(/\r|\n/g, '')
        .replace(
          /^<svg([^>+].*?)>/,
          // eslint-disable-next-line prettier/prettier
          (_, p1) => `<symbol id="icon-${entry.name.replace(/.svg$/, '')}" ${/viewBox="[^>+].*?"/.exec(p1)}>`
        )
        .replace(/<\/svg>$/, '</symbol>')
      symbols.push(symbol)
    }
  }

  return symbols
}

export default function svgLoader(path) {
  if (!path || !_fs.existsSync(path)) return

  return {
    name: 'svg-loader',
    configureServer(server) {
      server.watcher.add(path)
      server.watcher.on('add', () => {
        server.ws.send({ type: 'full-reload' })
      })
    },
    transformIndexHtml(html) {
      const symbols = loadSymbols(path)

      return html.replace(
        '<body>',
        // eslint-disable-next-line prettier/prettier
        `<body><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: none;">${symbols.join('')}</svg>`
      )
    }
  }
}
