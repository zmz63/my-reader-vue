import { spawn } from 'child_process'
import { build, createServer } from 'vite'
import electron from 'electron'
import { distMainPath, distPreloadPath, mainPath, preloadPath } from './paths.mjs'
import { configFactory, rendererConfigFactory } from './config.mjs'

const env = 'development'

process.env.NODE_ENV = env

const server = await createServer(rendererConfigFactory(env))
await server.listen()
// server.printUrls()

await build(
  configFactory(env, preloadPath, distPreloadPath, [
    {
      name: 'electron-preload',
      closeBundle() {
        server.ws.send({ type: 'full-reload' })
      }
    }
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
        process.electronApp = spawn(electron, ['.'], { stdio: 'inherit', env })
        process.electronApp.once('exit', process.exit)
      }
    }
  ])
)
