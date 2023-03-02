import type { Rendition } from '..'
import { RenditionLayout } from '../constants'
import type { Content } from '../content'
import type { Stage } from '../stage'
import type { View } from '../view'
import type { Views } from '../views'

export type PaginationOptions = {
  layout: RenditionLayout
  spread: boolean
  minSpreadWidth: number
  gap: number
}

export type PaginationViewData = {
  width: number
  height: number
  divisor: number
  gap: number
  columnWidth: number
}

export class PaginationController {
  stage: Stage

  views: Views

  options: PaginationOptions = {
    layout: RenditionLayout.Relowable,
    spread: true,
    minSpreadWidth: 800,
    gap: 0
  }

  viewData: PaginationViewData = {
    width: 0,
    height: 0,
    divisor: 1,
    gap: 0,
    columnWidth: 0
  }

  constructor(rendition: Rendition, options: Partial<PaginationOptions>) {
    this.stage = rendition.stage
    this.views = rendition.views
    Object.assign(this.options, options)
  }

  display() {
    //
  }

  prev() {
    //
  }

  next() {
    //
  }

  async initContentLayout(view: View) {
    await view.loaded

    const content = view.content as Content

    content.setStyle('overflow', 'hidden', true)
    content.setStyle('margin', '0px', true)
    content.setStyle('border', 'none', true)
    content.setStyle('padding-top', '20px', true)
    content.setStyle('padding-bottom', '20px', true)
    content.setStyle('box-sizing', 'border-box', true)
    content.setStyle('max-width', 'inherit', true)
    content.setStyle('column-fill', 'auto', true)
  }

  updateStageLayout() {
    const data: PaginationViewData = {
      width: this.stage.width,
      height: this.stage.height,
      divisor: 1,
      gap: 0,
      columnWidth: this.stage.width
    }

    data.divisor = this.options.spread && data.width >= this.options.minSpreadWidth ? 2 : 1
    data.gap = this.options.gap || Math.floor(data.width / 12)
    data.columnWidth = data.width / data.divisor - data.gap

    this.viewData = data
  }

  updateViewLayout(view: View, content: Content) {
    const layout = this.options.layout

    if (layout === RenditionLayout.Relowable) {
      const { width, height, divisor, gap, columnWidth } = this.viewData

      content.setStyle('width', '100%', true)
      content.setStyle('height', `${height}px`, true)
      content.setStyle('padding-left', `${gap / 2}px`, true)
      content.setStyle('padding-right', `${gap / 2}px`, true)
      content.setStyle('column-gap', `${gap}px`, true)
      content.setStyle('column-width', `${columnWidth}px`, true)

      view.setSize(content.scrollWidth(), height)

      return
    } else if (layout === RenditionLayout.PrePaginated) {
      const { width } = this.viewData
    }
  }

  setSpread() {
    //
  }

  clear() {
    //
  }

  destroy() {
    //
  }
}
