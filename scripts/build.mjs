import _path from 'path'
import _fs from 'fs-extra'
import { build } from 'vite'
import {
  distMainPath,
  distPath,
  distPreloadPath,
  mainPath,
  preloadPath,
  rootPath
} from './paths.mjs'
import { configFactory, rendererConfigFactory } from './config.mjs'
import wasmLoader from './plugins/wasm-loader.mjs'
import nodeWorkerLoader from './plugins/node-worker-loader.mjs'

const env = 'production'

process.env.NODE_ENV = env

await build(rendererConfigFactory(env))

await build(configFactory(env, preloadPath, distPreloadPath, [wasmLoader()]))

await build(configFactory(env, mainPath, distMainPath, [nodeWorkerLoader()]))

_fs.mkdirsSync(_path.join(distPath, 'lib'))

_fs.copyFileSync(
  _path.join(rootPath, 'lib', 'better_sqlite3.node'),
  _path.join(distPath, 'lib', 'better_sqlite3.node')
)
