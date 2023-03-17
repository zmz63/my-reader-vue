import MagicString from 'magic-string'

const NODE_WORKER_PARAMETER = '?node-worker'

const NODE_WORKER_ASSET_URL = /__VITE_NODE_WORKER__([a-z\d]{8})__/g

export default function nodeWorkerLoader() {
  return {
    name: 'node-worker-loader',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id.endsWith(NODE_WORKER_PARAMETER)) {
        return this.resolve(id.slice(0, id.length - NODE_WORKER_PARAMETER.length), importer).then(
          resolvedId => resolvedId.id + NODE_WORKER_PARAMETER
        )
      }
    },
    load(id) {
      if (id.endsWith(NODE_WORKER_PARAMETER)) {
        const hash = this.emitFile({
          type: 'chunk',
          id: id.slice(0, id.length - NODE_WORKER_PARAMETER.length)
        })

        return `
        import { Worker } from 'worker_threads'
        export default (options) => new Worker(require.resolve(__VITE_NODE_WORKER__${hash}__), options)`
      }
    },
    renderChunk(code) {
      if (code.match(NODE_WORKER_ASSET_URL)) {
        let match
        const magicString = new MagicString(code)

        while ((match = NODE_WORKER_ASSET_URL.exec(code))) {
          const [full, hash] = match

          magicString.overwrite(
            match.index,
            match.index + full.length,
            `"./${this.getFileName(hash)}"`,
            {
              contentOnly: true
            }
          )
        }

        return {
          code: magicString.toString()
        }
      }
    }
  }
}
