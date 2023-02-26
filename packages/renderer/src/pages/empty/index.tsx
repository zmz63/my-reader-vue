import { defineComponent, ref } from 'vue'
import './index.scss'

import epub from '@/epub'

export default defineComponent({
  setup() {
    const testRef = ref<HTMLDivElement>()

    let book: any

    let rendition: any

    setTimeout(() => {
      console.log(rendition)
    }, 100000)

    const testEPub = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '*'
      input.onchange = event => {
        const files = (event.target as HTMLInputElement).files
        if (files) {
          book = epub(files[0])
          console.log(book)
          rendition = book.renderTo(document.body, {
            manager: 'continuous',
            flow: 'scrolled',
            width: '60%'
          })
          console.log(rendition)
          const displayed = rendition.display(1)
          displayed.then(() => {
            // -- do stuff
          })

          // Navigation loaded
          book.loaded.navigation.then((toc: any) => {
            console.log(toc)
          })
        }
      }
      input.click()
    }
    return () => (
      <div class="empty">
        <div class="button" onClick={testEPub}>
          打开
        </div>
        <div ref={testRef}></div>
      </div>
    )
  }
})
