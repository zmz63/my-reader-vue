import { Queue } from '@packages/common/queue'
import type { EPub } from '.'
import { ViewManager } from './manager'

export type EPubRenditionOptions = {
  width: number | string
  height: number | string
  flow: string
  layout: string
  spread: string
  direction: string
}

export class Rendition {
  ePub: EPub

  queue = new Queue(this)

  manager = new ViewManager()

  options: EPubRenditionOptions = {
    width: '100%',
    height: '100%',
    flow: 'auto',
    layout: 'reflowable',
    spread: 'auto',
    direction: 'ltr'
  }

  constructor(ePub: EPub) {
    this.ePub = ePub
  }

  async init() {
    await this.ePub.opened.promise
  }
}
