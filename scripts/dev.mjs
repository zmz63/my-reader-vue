import { spawn } from 'child_process'
import { builtinModules } from 'module'
import { build, createServer } from 'vite'
import electron from 'electron'
import vueJsx from '@vitejs/plugin-vue-jsx'
import {
  distMainPath,
  distPreloadPath,
  mainPath,
  packagesPath,
  preloadPath,
  rendererPath,
  rendererSrcPath
} from './paths.mjs'
import packageConfig from '../package.json' assert { type: 'json' }

const env = 'development'

process.env.NODE_ENV = env

const { dependencies } = packageConfig

const devConfig = {
  configFile: false,
  root: rendererPath,
  plugins: [vueJsx()],
  resolve: {
    alias: {
      '@packages': packagesPath,
      '@main': mainPath,
      '@preload': preloadPath,
      '@': rendererSrcPath
    }
  },
  optimizeDeps: {
    exclude: ['electron', ...builtinModules]
  },
  server: {
    port: 8080
  }
}

const server = await createServer(devConfig)
await server.listen()
// server.printUrls()

const configFactory = (root, outDir, plugins) => ({
  configFile: false,
  root,
  mode: env,
  plugins,
  resolve: {
    alias: {
      '@packages': packagesPath,
      '@main': mainPath,
      '@preload': preloadPath,
      '@': rendererSrcPath
    }
  },
  build: {
    target: 'esnext',
    outDir,
    emptyOutDir: true,
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: () => '[name].js'
    },
    rollupOptions: {
      external: ['electron', ...builtinModules, ...Object.keys(dependencies)]
    },
    minify: false,
    watch: {}
  }
})

await build(
  configFactory(preloadPath, distPreloadPath, [
    {
      name: 'electron-preload',
      closeBundle() {
        server.ws.send({ type: 'full-reload' })
      }
    }
  ])
)

await build(
  configFactory(mainPath, distMainPath, [
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
