import { Hook } from '@packages/common/hook'

export class Stage {
  wrapper: HTMLDivElement

  container: HTMLDivElement

  element: Element | null = null

  observer: ResizeObserver

  readonly hooks: Readonly<{
    resize: Hook<() => void>
  }> = {
    resize: new Hook()
  }

  constructor() {
    this.wrapper = this.createWrapper()
    this.container = this.createContainer()
    this.observer = new ResizeObserver(() => {
      this.hooks.resize.trigger()
    })
    this.observer.observe(this.wrapper)
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
    wrapper.style.display = 'flex'
    wrapper.style.justifyContent = 'center'
    wrapper.style.alignItems = 'center'

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

    return element
  }

  getWrapperSize() {
    return {
      width: this.wrapper.clientWidth,
      height: this.wrapper.clientHeight
    }
  }

  setSize(width: number, height: number, minWidth = 0, minHeight = 0) {
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

  setDirection(direction: 'ltr' | 'rtl') {
    this.container.dir = direction
    this.container.style.direction = direction
  }

  destroy() {
    if (this.element) {
      this.element.removeChild(this.wrapper)
    }
  }
}
