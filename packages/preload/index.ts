import * as appChannel from './channel/app'
import * as windowChannel from './channel/window'
import * as dbChannel from './channel/db'
import * as ePub from './epub'

type AppChannel = typeof appChannel
type WindowChannel = typeof windowChannel
type DBChannel = typeof dbChannel
type EPub = typeof ePub

window.appChannel = appChannel
window.windowChannel = windowChannel
window.dbChannel = dbChannel
window.ePub = ePub

declare global {
  interface Window {
    appChannel: AppChannel
    windowChannel: WindowChannel
    dbChannel: DBChannel
    ePub: EPub
  }

  const appChannel: AppChannel
  const windowChannel: WindowChannel
  const dbChannel: DBChannel
  const ePub: EPub
}
