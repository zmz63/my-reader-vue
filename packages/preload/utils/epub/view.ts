import { extend } from '../common'
import type { Section } from '.'
import type EPub from '.'
import IframeView from './iframe'

export type ViewOptions = {
  layout: 'scroll' | 'pagination'
  axis: ViewOptions['layout'] extends 'pagination' ? 'horizontal' | 'vertical' : 'vertical'
  allowScripts: boolean
  allowPopups: boolean
  backgroundColor: string
  fontSize: number
  padding: number
}

const defaultOptions: ViewOptions = {
  layout: 'scroll',
  axis: 'vertical',
  allowScripts: false,
  allowPopups: false,
  backgroundColor: '',
  fontSize: 16,
  padding: 0.05
}

class EPubView {
  id: symbol

  views: IframeView[] = []

  sections: Record<string, Section>

  section: Section

  options: ViewOptions

  width: number

  height: number

  constructor(public ePub: EPub, public container: HTMLElement, options?: Partial<ViewOptions>) {
    const { width, height } = this.container.getBoundingClientRect()

    this.id = Symbol()
    this.sections = this.ePub.sections
    this.section = this.ePub.start
    this.options = extend<ViewOptions>(options, defaultOptions)
    this.width = width
    this.height = height

    this.ePub.views[this.id] = this
  }

  resize() {
    const { width, height } = this.container.getBoundingClientRect()

    this.width = width
    this.height = height
  }

  render(section?: Section) {
    if (section) {
      this.section = section
    }

    const { layout, axis } = this.options

    if (layout === 'scroll') {
      this.ePub.createSectionUrl(this.section)
      this.views.push(new IframeView(this, this.section, this.options))
      this.container.append(this.views[0].iframe)
    }

    // const handleLoad = (content: Document) => {
    //   if (!section) return

    //   section = section.next

    //   if (section && content.documentElement.offsetHeight <= this.container.offsetHeight) {
    //     this.generateIframe(section, handleLoad)
    //   }
    // }
    // const iframe = this.generateIframe(section, handleLoad)

    // this.container.append(iframe)
    // this.container.onscroll = () => {
    //   if (!section) return

    //   const { scrollTop, clientHeight, scrollHeight } = this.container

    //   if (scrollTop + clientHeight >= scrollHeight - this.container.offsetHeight) {
    //     const iframe = this.generateIframe(section, handleLoad)
    //     this.container.append(iframe)
    //   }
    // }
  }

  prev() {
    if (this.section.prev) {
      this.section = this.section.prev
      this.ePub.createSectionUrl(this.section)
      this.views.pop()?.iframe.remove()
      this.views.push(new IframeView(this, this.section, this.options))
      this.container.append(this.views[0].iframe)
    }
  }

  next() {
    if (this.section.next) {
      this.section = this.section.next
      this.ePub.createSectionUrl(this.section)
      this.views.pop()?.iframe.remove()
      this.views.push(new IframeView(this, this.section, this.options))
      this.container.append(this.views[0].iframe)
    }
  }

  destroy() {
    for (const view of this.views) {
      view.iframe.remove()
    }

    delete this.ePub.views[this.id]
  }
}

export default EPubView
