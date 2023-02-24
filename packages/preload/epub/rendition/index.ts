import { Queue } from '@packages/common/queue'
import type { Book } from '../book'
import { Layout } from './layout'
import { ViewManager } from './manager'

export type RenditionOptions = {
  layout: 'reflowable' | 'pre-paginated'
  width: number
  height: number
  spread: boolean
  minSpreadWidth: number
  gap: number
  flow: 'paginated' | 'scrolled-continuous' | 'scrolled-doc'
  direction: 'ltr' | 'rtl'
}

export class Rendition {
  book: Book

  layout: Layout

  manager: ViewManager

  queue = new Queue(this)

  constructor(book: Book, element: Element) {
    this.book = book
    // TODO
    this.layout = new Layout({})
    this.manager = new ViewManager(this.layout)

    this.queue.enqueue(this.init, true, element)
  }

  async init(element: Element) {
    await this.book.opened

    this.layout.attachTo(element)
  }

  async display(target: number | string) {
    const section = this.book.spine.get(target)

    if (!section) {
      // TODO
      throw new Error()
    }

    this.manager.display(section)
  }
}
