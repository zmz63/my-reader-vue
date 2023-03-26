import { type Raw, defineComponent, markRaw, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton } from 'naive-ui'
import type { Book, Metadata, PaginationRenderer } from '@preload/epub'
import type { BookData } from '@preload/channel/db'
import { useLayoutStore } from '@/stores/layout'
import SVGIcon from '@/components/SVGIcon'
import SideBar from './components/SideBar'
import './index.scss'

export default defineComponent({
  setup() {
    const route = useRoute()

    const router = useRouter()

    const layoutStore = useLayoutStore()

    const containerRef = ref<HTMLDivElement>(undefined as unknown as HTMLDivElement)

    const { path, id } = route.query as Partial<{ path: string; id: string }>

    const bookData = reactive({
      book: null as Raw<Book> | null,
      renderer: null as Raw<PaginationRenderer> | null,
      id: null as number | bigint | null,
      metadata: {} as Partial<Metadata>
    })

    const updateReadingLocation = (location: string) => {
      if (bookData.id) {
        dbChannel.updateBook(bookData.id, {
          location
        })
      }
    }

    const updateAccessTime = () => {
      if (bookData.id) {
        const time = Date.now()
        dbChannel.updateBook(bookData.id, {
          accessTime: time
        })
      }
    }

    const init = async () => {
      let location: string | undefined
      try {
        if (path) {
          bookData.book = markRaw(new ePub.Book(path, { unpack: true }))

          await bookData.book.opened

          const { title, creator, description, date, publisher, identifier } =
            bookData.book.package.metadata

          const book: BookData = {
            md5: bookData.book.md5,
            size: (bookData.book.file as Buffer).byteLength,
            createTime: Math.floor(Date.now() / 1000),
            path,
            title,
            cover: bookData.book.package.cover,
            creator,
            description,
            date,
            publisher,
            identifier
          }

          const result = await dbChannel.insertBook(book)

          if (typeof result === 'object') {
            bookData.id = result.rowid
            location = result.location
          } else {
            bookData.id = result
          }
        } else if (id) {
          const result = await dbChannel.getBookById(BigInt(id))
          if (result) {
            bookData.book = markRaw(
              new ePub.Book(Buffer.from(result.file as Buffer), { unpack: true })
            )
            bookData.id = BigInt(id)
            location = result.location
          }
        }

        if (bookData.book) {
          bookData.renderer = markRaw(new ePub.PaginationRenderer(bookData.book))

          await bookData.book.opened

          bookData.metadata = bookData.book.package.metadata

          layoutStore.topBarSlot = () => (
            <div class="top-bar-slot">
              <div class="title">{bookData.metadata.title}</div>
              <div class="divider">-</div>
              <div class="creator">{bookData.metadata.creator}</div>
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
      const location = await defer

      console.log('location', location)

      if (bookData.id && bookData.renderer) {
        bookData.renderer.attachTo(containerRef.value)
        bookData.renderer.display(location)

        updateAccessTime()
      } else {
        router.replace({
          name: 'START'
        })
      }
    })

    onBeforeUnmount(() => {
      bookData.renderer?.destroy()
      bookData.book?.destroy()

      bookData.renderer = null
      bookData.book = null

      layoutStore.topBarSlot = null
    })

    const prevPage = async () => {
      if (bookData.renderer) {
        await bookData.renderer.prev()
        updateReadingLocation(bookData.renderer.location.cfi)
      }
    }

    const nextPage = async () => {
      if (bookData.renderer) {
        await bookData.renderer.next()
        updateReadingLocation(bookData.renderer.location.cfi)
      }
    }

    const handleSideTranslate = (value: number) => {
      if (value) {
        containerRef.value.style.width = `calc(100% - ${value}px)`
      } else {
        containerRef.value.style.width = '100%'
      }
    }

    return () => (
      <div class="reader-page">
        <SideBar
          book={bookData.book}
          renderer={bookData.renderer}
          onTranslate={handleSideTranslate}
        />
        <div ref={containerRef} class="reader-page-container">
          <div class="top-bar">
            <div class="left"></div>
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
