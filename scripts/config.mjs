import _module from 'module'
import _path from 'path'
import vueJsx from '@vitejs/plugin-vue-jsx'
import {
  commonPath,
  distRendererPath,
  mainPath,
  preloadPath,
  publicPath,
  rendererPath,
  rendererSrcPath
} from './paths.mjs'
import svgLoader from './plugins/svg-loader.mjs'
import packageConfig from '../package.json' assert { type: 'json' }

const { devDependencies } = packageConfig

const alias = {
  '@main': mainPath,
  '@preload': preloadPath,
  '@common': commonPath,
  '@': rendererSrcPath
}

export function rendererConfigFactory(mode) {
  const isDev = mode === 'development'

  return {
    configFile: false,
    root: rendererPath,
    mode,
    base: './',
    envDir: './',
    publicDir: publicPath,
    plugins: [vueJsx(), svgLoader(_path.join(rendererSrcPath, 'icons'))],
    resolve: {
      alias
    },
    build: {
      outDir: distRendererPath,
      emptyOutDir: true,
      sourcemap: isDev,
      target: 'esnext'
    },
    optimizeDeps: {
      exclude: ['electron', ..._module.builtinModules]
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
    define: {
      __DEV__: isDev ? 'true' : 'false'
    },
    resolve: {
      alias
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
      commonjsOptions: {
        ignoreDynamicRequires: true
      },
      rollupOptions: {
        external: [
          'electron',
          /.node$/,
          ..._module.builtinModules,
          ...(isDev ? Object.keys(devDependencies) : [])
        ]
      },
      minify: isProd,
      watch: isDev ? {} : null
    }
  }
}
