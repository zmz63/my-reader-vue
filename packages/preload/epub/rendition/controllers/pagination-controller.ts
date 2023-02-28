import type { Rendition } from '..'
import type { Stage } from '../stage'
import type { Views } from '../views'

export type PaginationOptions = {
  spread: boolean
  minSpreadWidth: number
  gap: number
}

export class PaginationController {
  stage: Stage

  views: Views

  constructor(rendition: Rendition, options: Partial<PaginationOptions>) {
    this.stage = rendition.stage
    this.views = rendition.views
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

  updateStageLayout() {
    //
  }

  updateViewLayout() {
    //
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
