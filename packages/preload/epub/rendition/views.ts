import type { Section } from '..'
import type { View } from './view'

export class Views {
  private container: HTMLDivElement

  private views: View[] = []

  constructor(container: HTMLDivElement) {
    this.container = container
  }

  get length() {
    return this.views.length
  }

  all() {
    return this.views
  }

  indexOf(view: View, index?: number) {
    return this.views.indexOf(view, index)
  }

  slice(start?: number, end?: number) {
    return this.views.slice(start, end)
  }

  get(index: number) {
    return this.views[index]
  }

  set(index: number, view: View) {
    if (this.views[index]) {
      this.destroyView(this.views[index])
    }

    if (this.container) {
      this.container.appendChild(view.wrapper)
    }

    this.views[index] = view
  }

  append(view: View) {
    this.views.push(view)

    if (this.container) {
      this.container.appendChild(view.wrapper)
    }

    return view
  }

  prepend(view: View) {
    this.views.unshift(view)

    if (this.container) {
      this.container.insertBefore(view.wrapper, this.container.firstChild)
    }

    return view
  }

  insert(view: View, index: number) {
    this.views.splice(index, 0, view)

    if (this.container) {
      if (index < this.container.children.length) {
        this.container.insertBefore(view.wrapper, this.container.children[index])
      } else {
        this.container.appendChild(view.wrapper)
      }
    }

    return view
  }

  remove(view: View) {
    const index = this.views.indexOf(view)

    if (index > -1) {
      this.views.splice(index, 1)
    }

    this.destroyView(view)
  }

  forEach(callback: (value: View, index: number, array: View[]) => void) {
    return this.views.forEach(callback)
  }

  clear() {
    if (!this.length) return

    for (const view of this.views) {
      this.destroyView(view)
    }

    this.views = []
  }

  find(section: Section) {
    for (const view of this.views) {
      if (view.section.index === section.index) {
        return view
      }
    }
  }

  destroyView(view: View) {
    view.destroy()

    if (this.container) {
      this.container.removeChild(view.wrapper)
    }
  }
}
