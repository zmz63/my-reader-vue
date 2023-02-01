import _fs from 'fs-extra'

export default function wasmLoader() {
  return {
    name: 'wasm-loader',
    enforce: 'pre',
    async load(id) {
      if (/\.wasm$/.test(id)) {
        return `export default '${(await _fs.readFile(id)).toString('base64')}'`
      }
    }
  }
}
