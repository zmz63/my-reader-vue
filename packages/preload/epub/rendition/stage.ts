import { Hook } from '@packages/common/hook'

export class Stage {
  wrapper: HTMLDivElement

  container: HTMLDivElement

  element: Element | null = null

  observer: ResizeObserver

  width = 0

  height = 0

  containerWidth = 0

  containerHeight = 0

  x = 0

  y = 0

  readonly hooks: Readonly<{
    resize: Hook<() => void>
  }> = {
    resize: new Hook()
  }

  constructor() {
    this.wrapper = this.createWrapper()
    this.container = this.createContainer()
    this.observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect
        this.width = width
        this.height = height
        this.hooks.resize.trigger()
      }
    })
  }

  private createWrapper() {
    const wrapper = document.createElement('div')

    wrapper.classList.add('epub-wrapper')

    wrapper.style.height = '100%'
    wrapper.style.width = '100%'
    wrapper.style.minWidth = '0px'
    wrapper.style.minHeight = '0px'
    wrapper.style.position = 'relative'
    wrapper.style.overflow = 'hidden'

    return wrapper
  }

  private createContainer() {
    const container = document.createElement('div')

    container.classList.add('epub-container')

    container.style.width = '0px'
    container.style.height = '0px'
    container.style.wordSpacing = '0'
    container.style.lineHeight = '0'
    container.style.verticalAlign = 'top'
    container.style.position = 'relative'
    container.style.overflow = 'hidden'

    this.wrapper.appendChild(container)

    return container
  }

  attachTo(element: Element) {
    element.appendChild(this.wrapper)
    this.element = element

    this.observer.observe(element)

    return element
  }

  setSize(width: number, height: number, minWidth = 0, minHeight = 0) {
    this.containerWidth = width
    this.containerHeight = height

    this.container.style.width = `${width}px`
    this.container.style.height = `${height}px`

    this.wrapper.style.minWidth = `${minWidth}px`
    this.wrapper.style.minHeight = `${minHeight}px`
  }

  setAxis(axis: 'vertical' | 'horizontal') {
    if (axis === 'horizontal') {
      this.container.style.display = 'flex'
      this.container.style.flexDirection = 'row'
      this.container.style.flexWrap = 'nowrap'
    } else {
      this.container.style.display = 'block'
    }
  }

  setTranslate(x: number, y: number) {
    this.x = x
    this.y = y

    this.container.style.translate = `${x}px ${y}px`
  }

  setTranslateOffset(x: number, y: number) {
    this.x += x
    this.y += y

    this.container.style.translate = `${this.x}px ${this.y}px`
  }

  scrollTo(x: number, y: number) {
    this.setTranslate(-x, -y)
  }

  scrollOffset(x: number, y: number) {
    this.setTranslateOffset(-x, -y)
  }

  destroy() {
    this.observer.disconnect()

    if (this.element) {
      this.element.removeChild(this.wrapper)
    }
  }
}
