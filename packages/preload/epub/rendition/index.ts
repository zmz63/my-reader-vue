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
  options: RenditionOptions = {
    layout: 'reflowable',
    width: 0,
    height: 0,
    spread: false,
    minSpreadWidth: 800,
    gap: 0,
    flow: 'paginated',
    direction: 'ltr'
  }

  book: Book

  layout: Layout

  manager: ViewManager

  queue = new Queue(this)

  constructor(book: Book, element: Element, options?: Partial<RenditionOptions>) {
    Object.assign(this.options, options)
    this.book = book
    // TODO
    this.layout = new Layout({})
    this.manager = new ViewManager(this.layout)

    this.init(element)
  }

  private async init(element: Element) {
    await this.book.opened

    this.manager.render

    this.layout.attachTo(element)
  }

  display(target: number | string) {
    const section = this.book.spine.get(target)

    if (!section) {
      // TODO
      throw new Error()
    }

    return this.queue.enqueue(this.manager.display.bind(this.manager), section)
  }

  prev() {
    //
  }

  next() {
    //
  }
}
