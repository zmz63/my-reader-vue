import {
  type Raw,
  defineComponent,
  markRaw,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
  watchEffect
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NPopover, NSpin } from 'naive-ui'
import { debounce } from 'lodash'
import type { Book, LocationData, Metadata, PaginationRenderer, TocItem, View } from '@preload/epub'
import type { BookData, HighlightData } from '@preload/channel/db'
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

    const isLoading = ref(true)

    const bookData = reactive({
      id: null as number | bigint | null,
      book: null as Raw<Book> | null,
      renderer: null as Raw<PaginationRenderer> | null,
      metadata: {} as Partial<Metadata>,
      location: {} as Partial<LocationData>,
      chapter: '',
      highlights: [] as (HighlightData & { rowid: number | bigint })[]
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

    const popoverData = reactive({
      show: false,
      x: 0,
      y: 0
    })

    let selectionData: { view: View; selection: Selection; range: Range } | null = null

    const handleSelect = debounce((view: View, selection: Selection) => {
      console.log(selection.focusNode, selection.focusOffset)
      // const range = selection.getRangeAt(0)
      if (!view.content || !selection.focusNode) {
        return
      }

      const range = view.content.document.createRange()
      range.setStart(selection.focusNode, selection.focusOffset)
      range.collapse(true)

      const rect = view.rangeToViewportRect(range)

      if (rect) {
        selectionData = {
          view,
          selection,
          range
        }

        popoverData.show = true
        popoverData.x = rect.x
        popoverData.y = rect.y + rect.height / 2
      }
    }, 500)

    const handleCancelSelect = () => {
      if (selectionData) {
        selectionData.selection.empty()
        selectionData = null
      }

      popoverData.show = false
    }

    const displayData = reactive({
      highlight: false,
      note: false
    })

    const highlightMap = new Map<number, Range[]>()

    const updateHighlights = async (view: View) => {
      if (bookData.id) {
        const index = view.section.index

        if (highlightMap.has(index)) {
          return
        }

        const ranges: Range[] = []
        highlightMap.set(index, ranges)

        try {
          const result = await dbChannel.getHighlightList(bookData.id, index)

          if (bookData.renderer && bookData.renderer.views.indexOf(view) === -1) {
            return
          }

          for (const item of result) {
            const range = view.cfiToRange(item.location)

            if (range) {
              view.mark(range, 'book-mark-highlight-search')
              ranges.push(range)
            }
          }
        } catch {
          for (const range of ranges) {
            view.unMark(range)
          }
          highlightMap.delete(index)
        }
      }
    }

    watch(
      () => displayData.highlight,
      show => {
        if (bookData.renderer) {
          bookData.renderer.views.forEach(view => {
            if (show) {
              updateHighlights(view)
            } else {
              for (const [index, ranges] of highlightMap) {
                for (const range of ranges) {
                  view.unMark(range)
                }

                highlightMap.delete(index)
              }
            }
          })
        }
      }
    )

    const addHighlight = async () => {
      if (bookData.id && selectionData) {
        const { view, range } = selectionData

        const highlightData = {
          bookId: bookData.id,
          section: view.section.index,
          location: view.rangeToCFI(range) as string,
          createTime: Math.floor(Date.now() / 1000)
        }
        const result = await dbChannel.insertHighlight(highlightData)

        bookData.highlights.push({ rowid: result.rowid, ...highlightData })

        view.mark(range, 'book-mark-highlight-search')

        const ranges = highlightMap.get(view.section.index)
        if (ranges) {
          ranges.push(range)
        }

        handleCancelSelect()
      }
    }

    const removeHighlight = () => {
      //
    }

    const addNote = () => {
      // if (selectionData) {
      //   const { view, range } = selectionData
      //   view.mark(range, 'book-mark-highlight-search')
      //   const marks = bookData.highlights.get(view.section.index)
      //   if (marks) {
      //     marks.push(range)
      //   } else {
      //     bookData.highlights.set(view.section.index, [range])
      //   }
      //   handleCancelSelect()
      // }
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

      handleCancelSelect()
    }

    let spinTaskHandle: NodeJS.Timeout | null = null

    const handleBeforeRender = () => {
      spinTaskHandle = setTimeout(() => {
        spinTaskHandle = null
        isLoading.value = true
      }, 200)
    }

    const handleRendered = () => {
      if (spinTaskHandle) {
        clearTimeout(spinTaskHandle)
      }

      isLoading.value = false
    }

    const updateAccessTime = () => {
      if (bookData.id) {
        dbChannel.updateBook(bookData.id, {
          accessTime: Math.floor(Date.now() / 1000)
        })
      }
    }

    const openBook: () => Promise<{
      id: number | bigint
      book: Book
      location?: string
    } | null> = async () => {
      const { path, id } = route.query as Partial<{ path: string; id: string }>
      const dumpPath = await preloadUtil.getBookCachePath()

      if (path) {
        const file = await preloadUtil.openFile(path)
        const book = new ePub.Book(file, true, {
          path: dumpPath
        })

        await book.opened

        const { title, creator, description, date, publisher, identifier } = book.package.metadata

        const bookData: BookData = {
          md5: preloadUtil.md5(file),
          size: file.byteLength,
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

        layoutStore.topBarSlot = () => (
          <div class="top-bar-slot">
            <div class="ellipsis">{title}</div>
            <div class="divider">-</div>
            <div class="ellipsis">{creator}</div>
          </div>
        )

        const result = await dbChannel.insertBook(bookData)

        return {
          id: result.rowid,
          book,
          location: result.location
        }
      } else if (id) {
        const result = await dbChannel.getBookById(BigInt(id))

        if (result) {
          const book = new ePub.Book(Buffer.from(result.file as Buffer), true, {
            path: dumpPath
          })

          layoutStore.topBarSlot = () => (
            <div class="top-bar-slot">
              <div class="ellipsis">{result.title}</div>
              <div class="divider">-</div>
              <div class="ellipsis">{result.creator}</div>
            </div>
          )

          return {
            id: BigInt(id),
            book,
            location: result.location
          }
        }
      }

      return null
    }

    const deferBook = openBook()

    onMounted(async () => {
      try {
        const result = await deferBook

        if (result) {
          const { id, book, location } = result

          bookData.id = id
          bookData.book = markRaw(book)
          bookData.renderer = markRaw(new ePub.PaginationRenderer(bookData.book))

          await bookData.book.opened

          bookData.metadata = bookData.book.package.metadata

          bookData.renderer.attachTo(containerRef.value)
          bookData.renderer.display(location)

          bookData.renderer.hooks.location.register(handleUpdateLocation)
          bookData.renderer.hooks.select.register(handleSelect)
          bookData.renderer.hooks.cancelSelect.register(handleCancelSelect)
          bookData.renderer.hooks.beforeRender.register(handleBeforeRender)
          bookData.renderer.hooks.rendered.register(handleRendered)
          bookData.renderer.stage.hooks.resize.register(handleCancelSelect)

          updateAccessTime()
        } else {
          router.replace({
            name: 'START'
          })
        }
      } catch (error) {
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

    const handleSideBarTranslate = (value: number) => {
      if (value) {
        containerRef.value.style.width = `calc(100% - ${value}px)`
      } else {
        containerRef.value.style.width = '100%'
      }
    }

    return () => (
      <div ref={pageRef} class="reader-page">
        {isLoading.value && <NSpin class="reader-page-loading-mask" size="large" />}
        <NPopover
          to={pageRef.value}
          show={popoverData.show}
          x={popoverData.x}
          y={popoverData.y}
          trigger="manual"
          placement="bottom"
        >
          <div class="popover-content">
            <NButton text focusable={false} onClick={addHighlight}>
              <SVGIcon size={26} name="ic_fluent_highlight_24_filled" />
            </NButton>
            <NButton text focusable={false} onClick={addNote}>
              <SVGIcon size={26} name="ic_fluent_note_edit_24_filled" />
            </NButton>
          </div>
        </NPopover>
        <SideBar
          book={bookData.book}
          renderer={bookData.renderer}
          onTranslate={handleSideBarTranslate}
        />
        <div ref={containerRef} class="reader-page-container">
          <div class="top-bar">
            <div class="left"></div>
            <div class="center">{bookData.chapter}</div>
            <div class="right">
              <NButton
                text
                focusable={false}
                onClick={() =>
                  router.replace({
                    name: 'START'
                  })
                }
              >
                <SVGIcon size={24} name="ic_fluent_home_24_filled" />
              </NButton>
              <NButton text focusable={false}>
                <SVGIcon size={24} name="ic_fluent_settings_24_filled" />
              </NButton>
              <NButton text focusable={false} onClick={handleFullScreen}>
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
