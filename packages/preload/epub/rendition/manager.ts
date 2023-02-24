import type { Section } from '../book/section'
import type { Layout } from './layout'
import { View } from './view'
import { Views } from './views'

export class ViewManager {
  layout: Layout

  views: Views

  constructor(layout: Layout) {
    this.layout = layout

    this.views = new Views(this.layout.container)
  }

  render() {
    //
  }

  updateLayout() {
    //
  }

  display(section: Section) {
    const view = new View(section, this.layout)
  }

  // getSize() {
  //   const rect = this.container.getBoundingClientRect()

  //   return {
  //     width: rect.width,
  //     height: rect.height
  //   }
  // }
}
