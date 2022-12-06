import { defineComponent, ref } from 'vue'
import './index.scss'

import ePub from '@/epub'

const { importBook, renderBook, manageView } = window.electron.bookUtil

export default defineComponent({
  setup() {
    const containerRef = ref<HTMLElement>()

    let viewId = ''
    viewId = ''

    return () => (
      <div class="books">
        <div class="test">
          <div
            class="button"
            onClick={() => {
              // const book = ePub('./moby-dick.epub')
              // const rendition = book.renderTo(containerRef.value, {
              //   flow: 'scrolled',
              //   width: '100%'
              // })
              // rendition.display(5)

              importBook(true, 'D:\\BaiduNetdiskDownload\\moby-dick.epub')
                // importBook(true, 'D:\\BaiduNetdiskDownload\\春物01.epub')
                // div
                .then(({ result, errors }) => {
                  console.log(result, errors)
                  const meta = result[0]
                  if (containerRef.value && meta) {
                    renderBook(meta.id, containerRef.value).then(id => {
                      viewId = id
                    })
                  }
                })
            }}
          >
            Import
          </div>
          <div
            class="button"
            onClick={() => {
              manageView(viewId, 'prev')
            }}
          >
            Prev
          </div>
          <div
            class="button"
            onClick={() => {
              manageView(viewId, 'next')
            }}
          >
            Next
          </div>
        </div>
        <div class="view-container" ref={containerRef} />
      </div>
    )
  }
})
