import { Queue } from '@packages/common/queue'
import { Layout } from './layout'
import type { Book } from './book'
import { ViewManager } from './manager'

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
