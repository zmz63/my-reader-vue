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
  direction: 'ltr' | 'rtl'
  [key: string]: unknown
}

export class ViewManager {
  options: RenditionOptions

  viewOptions: ViewOptions = {
    width: 0,
    height: 0,
    divisor: 0,
    gap: 0,
    columnWidth: 0,
    axis: 'horizontal',
    direction: 'ltr'
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

    this.updateViewLayout(view)
  }

  updateStageLayout() {
    const wrapperSize = this.stage.getWrapperSize()

    const options: ViewOptions = {
      width: this.options.width || wrapperSize.width,
      height: this.options.height || wrapperSize.height,
      divisor: 1,
      gap: 0,
      columnWidth: this.options.width || wrapperSize.width,
      axis: this.viewOptions.axis,
      direction: this.options.direction
    }

    if (this.options.flow === 'paginated') {
      if (this.options.layout === 'pre-paginated') {
        options.divisor = this.options.spread && options.width * 2 <= wrapperSize.width ? 2 : 1
        options.width *= options.divisor
      } else {
        options.divisor =
          this.options.spread && options.width >= this.options.minSpreadWidth ? 2 : 1
        options.gap = this.options.gap || Math.floor(options.width / 12)
        options.columnWidth = options.width / options.divisor - options.gap
      }
      options.axis = 'horizontal'
    } else {
      options.axis = 'vertical'
    }

    let changed = false
    for (const key in this.viewOptions) {
      if (this.viewOptions[key] !== options[key]) {
        changed = true
        break
      }
    }

    if (changed) {
      this.viewOptions = options

      this.stage.setSize(options.width, options.height, this.options.width, this.options.height)
      this.stage.setAxis(options.axis)
      this.stage.setDirection(options.direction)

      this.views.forEach(view => {
        this.updateViewLayout(view)
      })
    }
  }

  updateViewLayout(view: View) {
    let width: number
    let height: number

    if (this.options.layout === 'pre-paginated') {
      //
      width = this.options.width
      height = this.options.height
    } else if (this.options.flow === 'paginated') {
      void (view.content as Content).setColumns(
        this.viewOptions.width,
        this.viewOptions.height,
        this.viewOptions.columnWidth,
        this.viewOptions.gap,
        this.viewOptions.direction
      )
      width = this.viewOptions.width
      height = this.viewOptions.height
    } else {
      width = this.viewOptions.width
      height = this.viewOptions.height
    }

    view.setSize(width, height)
  }

  setSize(width: number, height: number) {
    this.options.width = width
    this.options.height = height

    this.updateStageLayout()
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

  setDirection(direction: 'ltr' | 'rtl') {
    this.options.direction = direction

    this.updateStageLayout()
  }
}
