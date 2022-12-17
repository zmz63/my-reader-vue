import { builtinModules } from 'module'
import vueJsx from '@vitejs/plugin-vue-jsx'
import {
  distRendererPath,
  mainPath,
  packagesPath,
  preloadPath,
  rendererPath,
  rendererSrcPath
} from './paths.mjs'
import packageConfig from '../package.json' assert { type: 'json' }

const { dependencies } = packageConfig

export function rendererConfigFactory(mode) {
  const isDev = mode === 'development'

  return {
    configFile: false,
    root: rendererPath,
    mode,
    base: './',
    plugins: [vueJsx()],
    resolve: {
      alias: {
        '@packages': packagesPath,
        '@main': mainPath,
        '@preload': preloadPath,
        '@': rendererSrcPath
      }
    },
    build: {
      outDir: distRendererPath,
      emptyOutDir: true,
      sourcemap: isDev
    },
    optimizeDeps: {
      exclude: ['electron', ...builtinModules]
    },
    server: isDev
      ? {
          port: 8080
        }
      : undefined
  }
}

export function configFactory(mode, root, outDir, plugins) {
  const isDev = mode === 'development'
  const isProd = mode === 'production'

  return {
    configFile: false,
    root,
    mode,
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
        external: ['electron', ...builtinModules, ...(isDev ? Object.keys(dependencies) : [])]
      },
      minify: isProd,
      watch: isDev ? {} : null
    }
  }
}
