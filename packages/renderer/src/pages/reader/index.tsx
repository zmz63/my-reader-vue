import { type Raw, defineComponent, markRaw, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton } from 'naive-ui'
import type { Book, LocationData, Metadata, PaginationRenderer, TocItem } from '@preload/epub'
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

    const pageRef = ref<HTMLDivElement>(undefined as unknown as HTMLDivElement)

    const containerRef = ref<HTMLDivElement>(undefined as unknown as HTMLDivElement)

    const isFullScreen = ref(false)

    const { path, id } = route.query as Partial<{ path: string; id: string }>

    const bookData = reactive({
      book: null as Raw<Book> | null,
      renderer: null as Raw<PaginationRenderer> | null,
      id: null as number | bigint | null,
      metadata: {} as Partial<Metadata>,
      location: {} as Partial<LocationData>,
      chapter: ''
    })

    const handleFullScreen = async () => {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        isFullScreen.value = false
      } else {
        await pageRef.value.requestFullscreen({
          navigationUI: 'hide'
        })
        isFullScreen.value = true
      }
    }

    const handleUpdateLocation = (location: LocationData) => {
      if (bookData.id && location.cfi !== bookData.location.cfi) {
        dbChannel.updateBook(bookData.id, {
          location: location.cfi
        })
      }

      const navigation = bookData.book?.navigation
      if (navigation && location.index !== bookData.location.index) {
        bookData.chapter = ''

        const findChapter = (items: TocItem[]) => {
          for (const item of items) {
            if (item.index === location.index) {
              bookData.chapter = item.label
              return true
            } else if (item.subitems.length && findChapter(item.subitems)) {
              return true
            }
          }

          return false
        }

        findChapter(navigation.list)
      }

      bookData.location = location
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
        const dumpPath = await preloadUtil.getBookCachePath()

        if (path) {
          const file = await preloadUtil.openFile(path)
          bookData.book = markRaw(
            new ePub.Book(file, true, {
              path: dumpPath
            })
          )

          await bookData.book.opened

          const { title, creator, description, date, publisher, identifier } =
            bookData.book.package.metadata

          const book: BookData = {
            md5: preloadUtil.md5(file),
            size: file.byteLength,
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
              new ePub.Book(Buffer.from(result.file as Buffer), true, {
                path: dumpPath
              })
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
              <div class="ellipsis">{bookData.metadata.title}</div>
              <div class="divider">-</div>
              <div class="ellipsis">{bookData.metadata.creator}</div>
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

        bookData.renderer.hooks.location.register(handleUpdateLocation)

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
        bookData.renderer.prev()
      }
    }

    const nextPage = async () => {
      if (bookData.renderer) {
        bookData.renderer.next()
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
      <div ref={pageRef} class="reader-page">
        <SideBar
          book={bookData.book}
          renderer={bookData.renderer}
          onTranslate={handleSideTranslate}
        />
        <div ref={containerRef} class="reader-page-container">
          <div class="top-bar">
            <div class="left"></div>
            <div class="center">{bookData.chapter}</div>
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
              <NButton
                class="button"
                quaternary
                size="small"
                focusable={false}
                onClick={handleFullScreen}
              >
                <SVGIcon
                  size={24}
                  name={
                    isFullScreen.value
                      ? 'ic_fluent_arrow_minimize_24_filled'
                      : 'ic_fluent_arrow_expand_24_filled'
                  }
                />
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
