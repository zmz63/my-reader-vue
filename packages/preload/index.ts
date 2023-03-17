import * as appChannel from './channel/app'
import * as windowChannel from './channel/window'
import * as ePub from './epub'

type AppChannel = typeof appChannel
type WindowChannel = typeof windowChannel
type EPub = typeof ePub

window.appChannel = appChannel
window.windowChannel = windowChannel
window.ePub = ePub

declare global {
  interface Window {
    appChannel: AppChannel
    windowChannel: WindowChannel
    ePub: EPub
  }

  const appChannel: AppChannel
  const windowChannel: WindowChannel
  const ePub: EPub
}
