import { defineComponent, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '@/stores/book'
import './index.scss'

export default defineComponent({
  setup() {
    const router = useRouter()

    const bookStore = useBookStore()

    const containerRef = ref<HTMLDivElement>()

    if (!bookStore.currentBook) {
      router.replace({ name: 'START' })

      return () => null
    }

    const renderer = new ePub.PaginationRenderer(bookStore.currentBook)

    onMounted(() => {
      if (!containerRef.value) {
        return
      }

      renderer.attachTo(containerRef.value)
      renderer.display()
    })

    onBeforeUnmount(() => {
      renderer.destroy()

      //   if (bookStore.currentBook) {
      //     bookStore.currentBook.destroy()
      //     bookStore.currentBook = null
      //   }
    })

    const prevPage = () => {
      renderer.prev()
    }

    const nextPage = () => {
      renderer.next()
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
