import type { Section } from '../book/section'
import type { RenditionOptions } from '.'
import { Stage } from './stage'
import { View } from './view'
import { Views } from './views'
import type { Content } from './content'

export type ViewOptions = {
  width: number
  height: number
  divisor: number
  gap: number
  columnWidth: number
  axis: 'vertical' | 'horizontal'
}

export class ViewManager {
  options: RenditionOptions

  viewOptions: ViewOptions = {
    width: 0,
    height: 0,
    divisor: 0,
    gap: 0,
    columnWidth: 0,
    axis: 'horizontal'
  }

  stage = new Stage()

  views: Views

  constructor(options: RenditionOptions) {
    this.options = options
    this.views = new Views(this.stage.container)

    this.stage.hooks.resize.register(() => this.updateStageLayout())
  }

  render(element: Element) {
    this.stage.attachTo(element)
  }

  async display(section: Section) {
    const view = new View(section)
    this.views.append(view)

    await view.render()

    this.updateStageLayout()
  }

  prev() {
    if (!this.views.length) {
      return
    }

    if (this.options.flow === 'paginated') {
      //
    }
  }

  next() {
    //
  }

  updateStageLayout() {
    const options: ViewOptions = {
      width: this.stage.width,
      height: this.stage.height,
      divisor: 1,
      gap: 0,
      columnWidth: this.stage.width,
      axis: this.viewOptions.axis
    }

    if (this.options.flow === 'paginated') {
      if (this.options.layout === 'reflowable') {
        options.divisor =
          this.options.spread && options.width >= this.options.minSpreadWidth ? 2 : 1
        options.gap = this.options.gap || Math.floor(options.width / 12)
        options.columnWidth = options.width / options.divisor - options.gap
      } else if (this.options.layout === 'pre-paginated') {
        // TODO
      }
      options.axis = 'horizontal'
    } else {
      options.axis = 'vertical'
    }

    this.viewOptions = options

    this.stage.setAxis(options.axis)

    const sizeList: ReturnType<typeof this.updateViewLayout>[] = []
    this.views.forEach(view => {
      if (view.content && !view.hidden) {
        const size = this.updateViewLayout(view, view.content)
        sizeList.push(size)
      }
    })

    if (this.options.layout === 'pre-paginated') {
      // TODO
    } else if (this.options.flow === 'paginated') {
      const width = sizeList.reduce((prev, item) => prev + item.width, 0)
      this.stage.setSize(width, options.height)
    } else {
      const height = sizeList.reduce((prev, item) => prev + item.height, 0)
      this.stage.setSize(options.width, height, options.width, height)
    }
  }

  updateViewLayout(view: View, content: Content) {
    let width: number
    let height: number

    if (this.options.layout === 'pre-paginated') {
      // TODO
      width = this.viewOptions.width
      height = this.viewOptions.height
    } else if (this.options.flow === 'paginated') {
      const size = content.setColumns(
        this.viewOptions.width,
        this.viewOptions.height,
        this.viewOptions.columnWidth,
        this.viewOptions.gap
      )

      width = size.width
      height = size.height
    } else {
      const size = content.lockWidth(this.viewOptions.width)

      width = size.width
      height = size.height
    }

    view.setSize(width, height)

    return {
      width,
      height
    }
  }

  setSpread(spread: boolean, minSpreadWidth = 800, gap = 0) {
    this.options.spread = spread
    this.options.minSpreadWidth = minSpreadWidth
    this.options.gap = gap

    this.updateStageLayout()
  }

  setFlow(flow: 'paginated' | 'scrolled-continuous' | 'scrolled-doc') {
    this.options.flow = flow

    this.updateStageLayout()
  }
}
