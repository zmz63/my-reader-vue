import { defineComponent, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Book, PaginationRenderer } from '@preload/epub'
import './index.scss'

export default defineComponent({
  setup() {
    const route = useRoute()

    const router = useRouter()

    const containerRef = ref<HTMLDivElement>()

    const { path, id } = route.query as Partial<{ path: string; id: string }>

    let renderer: PaginationRenderer | null = null

    const init = async () => {
      let book: Book | null = null
      if (path) {
        book = new ePub.Book(path, { unpack: true })
      } else if (id) {
        const bookData = await dbChannel.getBookById(Number(id))
        if (bookData) {
          book = new ePub.Book(Buffer.from(bookData.file as Buffer), { unpack: true })
        }
      }

      if (book) {
        renderer = new ePub.PaginationRenderer(book)
      }
    }

    const defer = init()

    onMounted(async () => {
      if (!containerRef.value) {
        return
      }

      await defer

      if (renderer) {
        renderer.attachTo(containerRef.value)
        renderer.display()
      } else {
        router.replace({
          name: 'START'
        })
      }
    })

    onBeforeUnmount(() => {
      renderer?.destroy()
      renderer?.book.destroy()
    })

    const prevPage = () => {
      renderer?.prev()
    }

    const nextPage = () => {
      renderer?.next()
    }

    const pageData = reactive({
      showSideBar: false,
      sideBarContent: null as JSX.Element | null
    })

    const showSideBar = () => {
      pageData.showSideBar = true
    }

    return () => (
      <div class="reader-page">
        {pageData.showSideBar ? (
          <div class="reader-page-side-bar">
            <div class="content-wrapper">{pageData.sideBarContent}</div>
            <div class="divider" />
          </div>
        ) : null}
        <div ref={containerRef} class="reader-page-container">
          <div class="arrow prev" onClick={prevPage}>
            prev
          </div>
          <div class="arrow next" onClick={nextPage}>
            next
          </div>
        </div>
      </div>
    )
  }
})
