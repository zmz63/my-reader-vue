import type { Mark } from './mark'
import { coords, setCoords } from './utils'

export class Pane {
  target: HTMLElement

  container: HTMLElement

  element: SVGSVGElement

  marks: Mark[]

  constructor(target: HTMLElement, container: HTMLElement) {
    this.target = target
    this.container = container
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.marks = []

    this.element.style.position = 'absolute'
    this.element.setAttribute('pointer-events', 'none')

    this.container.appendChild(this.element)

    this.render()
  }

  addMark(mark: Mark) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    this.element.appendChild(g)
    mark.bind(g, this.container)

    this.marks.push(mark)

    mark.render()
    return mark
  }

  removeMark(mark: Mark) {
    const index = this.marks.indexOf(mark)

    if (index === -1) {
      return
    }

    const element = mark.unbind()
    this.element.removeChild(element as SVGElement)
    this.marks.splice(index, 1)
  }

  render() {
    setCoords(this.element, coords(this.target, this.container))
    for (const m of this.marks) {
      m.render()
    }
  }
}
