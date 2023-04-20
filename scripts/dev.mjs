import _cp from 'child_process'
import electron from 'electron'
import { build, createServer } from 'vite'
import { distMainPath, distPreloadPath, mainPath, preloadPath } from './paths.mjs'
import { configFactory, rendererConfigFactory } from './config.mjs'
import wasmLoader from './plugins/wasm-loader.mjs'
import nodeWorkerLoader from './plugins/node-worker-loader.mjs'

const env = 'development'

process.env.NODE_ENV = env

const server = await createServer(rendererConfigFactory(env))

await server.listen()

server.printUrls()

await build(
  configFactory(env, preloadPath, distPreloadPath, [
    {
      name: 'electron-preload',
      closeBundle() {
        server.ws.send({ type: 'full-reload' })
      }
    },
    wasmLoader()
  ])
)

await build(
  configFactory(env, mainPath, distMainPath, [
    {
      name: 'electron-main',
      closeBundle() {
        if (process.electronApp) {
          process.electronApp.removeAllListeners()
          process.electronApp.kill()
        }
        process.electronApp = _cp.spawn(electron, ['.'], { stdio: 'inherit', env })
        process.electronApp.once('exit', process.exit)
      }
    },
    nodeWorkerLoader()
  ])
)
