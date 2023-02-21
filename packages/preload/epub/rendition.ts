import { Queue } from '@packages/common/queue'
import type { Book } from './book'
import { ViewManager } from './manager'

export type RenditionOptions = {
  width: number | string
  height: number | string
  flow: string
  layout: string
  spread: string
  direction: string
}

export class Rendition {
  book: Book

  manager: ViewManager

  queue = new Queue(this)

  options: RenditionOptions = {
    width: '100%',
    height: '100%',
    flow: 'auto',
    layout: 'reflowable',
    spread: 'auto',
    direction: 'ltr'
  }

  constructor(book: Book) {
    this.book = book
    this.manager = new ViewManager()
  }

  async init() {
    await this.book.opened
  }

  async display(target: number | string) {
    const section = this.book.spine.get(target)

    if (!section) {
      // TODO
      throw new Error()
    }
  }
}
