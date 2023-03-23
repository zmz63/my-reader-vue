import { defineComponent, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Book, Metadata, PaginationRenderer } from '@preload/epub'
import type { BookData } from '@preload/channel/db'
import { useLayoutStore } from '@/stores/layout'
import './index.scss'
import SVGIcon from '@/components/SVGIcon'
import { NButton } from 'naive-ui'

export default defineComponent({
  setup() {
    const route = useRoute()

    const router = useRouter()

    const layoutStore = useLayoutStore()

    const containerRef = ref<HTMLDivElement>()

    const sideBarRef = ref<HTMLDivElement>()

    const { path, id } = route.query as Partial<{ path: string; id: string }>

    let book: Book | null = null

    let renderer: PaginationRenderer | null = null

    let bookId: number | bigint | null = null

    const metadata = ref<Partial<Metadata>>({})

    const updateReadingLocation = (location: string) => {
      if (bookId) {
        dbChannel.updateBook(bookId, {
          location
        })
      }
    }

    const updateAccessTime = () => {
      if (bookId) {
        const time = Date.now()
        dbChannel.updateBook(bookId, {
          accessTime: time
        })
      }
    }

    const init = async () => {
      let location: string | undefined
      try {
        if (path) {
          book = new ePub.Book(path, { unpack: true })

          await book.opened

          const { title, creator, description, date, publisher, identifier } = book.package.metadata

          const bookData: BookData = {
            md5: book.md5,
            size: (book.file as Buffer).byteLength,
            createTime: Math.floor(Date.now() / 1000),
            path,
            title,
            cover: book.package.cover,
            creator,
            description,
            date,
            publisher,
            identifier
          }

          const result = await dbChannel.insertBook(bookData)

          if (typeof result === 'object') {
            bookId = result.rowid
            location = result.location
          } else {
            bookId = result
          }
        } else if (id) {
          const result = await dbChannel.getBookById(BigInt(id))
          if (result) {
            book = new ePub.Book(Buffer.from(result.file as Buffer), { unpack: true })
            bookId = BigInt(id)
            location = result.location
          }
        }

        if (book) {
          renderer = new ePub.PaginationRenderer(book)

          await book.opened

          metadata.value = book.package.metadata

          layoutStore.topBarSlot = () => (
            <div class="top-bar-slot">
              <div class="title">{metadata.value.title}</div>
              <div class="divider">-</div>
              <div class="creator">{metadata.value.creator}</div>
            </div>
          )
        }
      } catch (error) {
        // TODO
      }

      return location
    }

    const defer = init()

    onMounted(async () => {
      if (!containerRef.value) {
        return
      }

      const location = await defer

      console.log('location', location)

      if (bookId && renderer) {
        renderer.attachTo(containerRef.value)
        // renderer.display(location)
        renderer.display()

        updateAccessTime()
      } else {
        router.replace({
          name: 'START'
        })
      }
    })

    onBeforeUnmount(() => {
      renderer?.destroy()
      book?.destroy()
    })

    const prevPage = () => {
      if (renderer) {
        renderer.prev()
        updateReadingLocation(renderer.location.cfi)
      }
    }

    const nextPage = () => {
      if (renderer) {
        renderer.next()
        updateReadingLocation(renderer.location.cfi)
      }
    }

    const pageData = reactive({
      showSideBar: false,
      sideBarContent: null as JSX.Element | null
    })

    const sideBarSwitch = () => {
      if (containerRef.value && sideBarRef.value) {
        if (pageData.showSideBar) {
          pageData.showSideBar = false
          sideBarRef.value.style.width = '0'
          containerRef.value.style.width = '100%'
        } else {
          pageData.showSideBar = true
          sideBarRef.value.style.width = '196px'
          containerRef.value.style.width = 'calc(100% - 196px)'
        }
      }
    }

    return () => (
      <div class="reader-page">
        <div ref={sideBarRef} class="reader-page-side-bar">
          <div class="tag" onClick={sideBarSwitch}>
            <SVGIcon
              size={18}
              name={
                pageData.showSideBar
                  ? 'ic_fluent_arrow_left_24_filled'
                  : 'ic_fluent_arrow_right_24_filled'
              }
            />
          </div>
          <div class="content-wrapper">{pageData.sideBarContent}</div>
          <div class="divider" />
        </div>
        <div ref={containerRef} class="reader-page-container">
          <div class="top-bar">
            <div class="left">
              {/* <NButton
                class="button"
                quaternary
                size="small"
                focusable={false}
                onClick={sideBarSwitch}
              >
                <SVGIcon
                  size={24}
                  name="ic_fluent_panel_left_24_filled"
                  v-show={!pageData.showSideBar}
                />
              </NButton> */}
            </div>
            <div class="center">center</div>
            <div class="right">
              <NButton
                class="button"
                quaternary
                size="small"
                focusable={false}
                onClick={() =>
                  router.replace({
                    name: 'START'
                  })
                }
              >
                <SVGIcon size={24} name="ic_fluent_home_24_filled" />
              </NButton>
              <NButton class="button" quaternary size="small" focusable={false}>
                <SVGIcon size={24} name="ic_fluent_settings_24_filled" />
              </NButton>
            </div>
          </div>
          <div class="arrow prev" onClick={prevPage}>
            <SVGIcon size={36} name="ic_fluent_ios_arrow_left_24_filled" />
          </div>
          <div class="arrow next" onClick={nextPage}>
            <SVGIcon size={36} name="ic_fluent_ios_arrow_right_24_filled" />
          </div>
        </div>
      </div>
    )
  }
})
