import _path from 'path'
import _url from 'url'

export const __dirname = _url.fileURLToPath(new URL('.', import.meta.url))

export const rootPath = _path.join(__dirname, '..')

export const releasePath = _path.join(rootPath, 'release')
export const distPath = _path.join(rootPath, 'dist')
export const publicPath = _path.join(rootPath, 'public')
export const packagesPath = _path.join(rootPath, 'packages')

export const distMainPath = _path.join(distPath, 'main')
export const distPreloadPath = _path.join(distPath, 'preload')
export const distRendererPath = _path.join(distPath, 'renderer')

export const mainPath = _path.join(packagesPath, 'main')
export const preloadPath = _path.join(packagesPath, 'preload')
export const rendererPath = _path.join(packagesPath, 'renderer')

export const rendererSrcPath = _path.join(rendererPath, 'src')
