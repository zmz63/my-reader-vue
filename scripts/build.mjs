import { build } from 'vite'
import { distMainPath, distPreloadPath, mainPath, preloadPath } from './paths.mjs'
import { configFactory, rendererConfigFactory } from './config.mjs'

const env = 'production'

process.env.NODE_ENV = env

await build(rendererConfigFactory(env))

await build(configFactory(env, preloadPath, distPreloadPath, []))

await build(configFactory(env, mainPath, distMainPath, []))
