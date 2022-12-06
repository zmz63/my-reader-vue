import { join } from 'path'
import { fileURLToPath } from 'url'

export const __dirname = fileURLToPath(new URL('.', import.meta.url))

export const rootPath = join(__dirname, '..')

export const releasePath = join(rootPath, 'release')
export const distPath = join(releasePath, 'dist')
export const distMainPath = join(distPath, 'main')
export const distPreloadPath = join(distPath, 'preload')
export const distRendererPath = join(distPath, 'renderer')

export const publicPath = join(rootPath, 'public')

export const packagesPath = join(rootPath, 'packages')
export const mainPath = join(packagesPath, 'main')
export const preloadPath = join(packagesPath, 'preload')
export const rendererPath = join(packagesPath, 'renderer')
export const rendererSrcPath = join(rendererPath, 'src')
