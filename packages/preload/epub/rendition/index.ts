import { Queue } from '@packages/common/queue'
import type { Book } from '../book'
import type { Metadata } from '../book/package'
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

export type CustomOptions = Partial<
  Pick<RenditionOptions, 'width' | 'height' | 'spread' | 'minSpreadWidth' | 'gap' | 'flow'>
>

export class Rendition {
  options: RenditionOptions = {
    layout: 'reflowable',
    width: 0,
    height: 0,
    spread: true,
    minSpreadWidth: 1000,
    gap: 0,
    flow: 'paginated',
    direction: 'rtl'
  }

  book: Book

  manager: ViewManager

  queue = new Queue(this)

  constructor(book: Book, element: Element, options?: CustomOptions) {
    this.book = book
    // TODO
    this.manager = new ViewManager(this.options)

    this.determineOptions(this.book.package.metadata, options)

    this.init(element)
  }

  private async init(element: Element) {
    await this.book.opened

    this.manager.render(element)
  }

  determineOptions(metadata: Metadata, options?: CustomOptions) {
    // TODO
  }

  async display(target: number | string) {
    await this.book.opened

    const section = this.book.spine.get(target)

    if (!section) {
      // TODO
      throw new Error()
    }

    return this.queue.enqueue(() => this.manager.display(section))
  }

  prev() {
    //
  }

  next() {
    //
  }
}
