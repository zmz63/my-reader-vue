import {
  type Raw,
  defineComponent,
  markRaw,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  watchEffect
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NPopover, NSpin, useMessage } from 'naive-ui'
import { debounce } from 'lodash'
import type { Book, LocationData, Metadata, PaginationRenderer, TocItem, View } from '@preload/epub'
import type { BookData, BookmarkData, HighlightData } from '@preload/channel/db'
import { useLayoutStore } from '@/stores/layout'
import { useBookStore } from '@/stores/book'
import SVGIcon from '@/components/SVGIcon'
import TextHover from '@/components/TextHover'
import SideBar, { type HighlightDisplayData } from './components/SideBar'
import SettingPanel, { type SettingPanelInst } from './components/SettingPanel'
import './index.scss'

export default defineComponent({
  setup() {
    const route = useRoute()

    const router = useRouter()

    const message = useMessage()

    const layoutStore = useLayoutStore()

    const bookStore = useBookStore()

    const pageRef = ref<HTMLDivElement>(undefined as unknown as HTMLDivElement)

    const containerRef = ref<HTMLDivElement>(undefined as unknown as HTMLDivElement)

    provide('container', containerRef)

    const settingPanelInst = ref<SettingPanelInst>()

    const isFullScreen = ref(false)

    const isLoading = ref(true)

    const bookData = reactive({
      id: null as number | bigint | null,
      book: null as Raw<Book> | null,
      renderer: null as Raw<PaginationRenderer> | null,
      metadata: {} as Partial<Metadata>,
      location: {} as LocationData,
      chapter: '',
      readingTime: 0
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
      y: 0,
      content: null as (() => JSX.Element) | null
    })

    let selectionData: { view: View; selection: Selection; range: Range } | null = null

    const handleSelect = debounce((view: View, selection: Selection) => {
      if (!view.content || !selection.focusNode) {
        return
      }

      const range = selection.getRangeAt(0)
      const [x, y] = view.getMousePoint()

      selectionData = {
        view,
        selection,
        range
      }

      popoverData.show = true
      popoverData.x = x
      popoverData.y = y
      popoverData.content = () => (
        <div class="popover-content">
          <TextHover
            text="添加标记"
            placement="right-start"
            content={() => (
              <NButton text focusable={false} onClick={addHighlight}>
                <SVGIcon size={26} name="ic_fluent_highlight_24_filled" />
              </NButton>
            )}
          />
          <TextHover
            text="复制文本"
            placement="right-start"
            content={() => (
              <NButton text focusable={false} onClick={() => copyText()}>
                <SVGIcon size={26} name="ic_fluent_copy_24_filled" />
              </NButton>
            )}
          />
        </div>
      )
    }, 500)

    const handleCancelSelect = () => {
      if (selectionData) {
        selectionData.selection.empty()
        selectionData = null
      }

      popoverData.show = false
    }

    const copyText = (range?: Range) => {
      if (range) {
        appChannel.copyText(range.toString())

        popoverData.show = false
      } else if (selectionData) {
        const { selection } = selectionData

        appChannel.copyText(selection.toString())

        handleCancelSelect()
      }
    }

    const bookmarkData = reactive({
      list: [] as BookmarkData[]
    })

    const getBookmarks = async () => {
      if (bookData.id) {
        const result = await dbChannel.getBookmarkList(bookData.id)

        bookmarkData.list = result
      }
    }

    const addBookmark = async () => {
      if (bookData.id && bookData.location.cfi && bookData.location.range) {
        const data = {
          bookId: bookData.id,
          section: bookData.location.index,
          fragment: bookData.location.range.startContainer.textContent || '',
          location: `${bookData.location.cfi.split(':')[0]}:0)`,
          createTime: Math.floor(Date.now() / 1000)
        }
        try {
          const result = await dbChannel.insertBookmark(data)

          bookmarkData.list.unshift({ id: result.id, ...data })
        } catch (error) {
          message.warning('当前位置已存在书签')
        }
      }
    }

    const removeBookmark = async (bookmark: BookmarkData) => {
      if (bookData.id) {
        await dbChannel.deleteBookmark(bookmark.id)

        for (let i = 0; i < bookmarkData.list.length; i++) {
          if (bookmarkData.list[i].id === bookmark.id) {
            bookmarkData.list.splice(i, 1)
            break
          }
        }
      }
    }

    const highlightData = reactive({
      show: true,
      list: [] as HighlightData[],
      all: true
    })

    const highlightIdMap = new Map<Range, number | bigint>()

    const highlightMap = new Map<number, Range[]>()

    const removeHighlight = async (view: View, target: Range) => {
      const index = view.section.index
      const ranges = highlightMap.get(index)

      if (ranges) {
        for (const range of ranges) {
          if (range === target) {
            const id = highlightIdMap.get(range) as number | bigint

            await dbChannel.deleteHighlight(id)

            view.unMark(range)
            highlightIdMap.delete(range)

            for (let i = 0; i < highlightData.list.length; i++) {
              if (highlightData.list[i].id === id) {
                highlightData.list.splice(i, 1)
                break
              }
            }

            popoverData.show = false

            break
          }
        }
      }
    }

    const handleClickHighligh = (event: MouseEvent, view: View, range: Range) => {
      popoverData.show = true
      popoverData.x = event.x
      popoverData.y = event.y
      popoverData.content = () => (
        <div class="popover-content">
          <TextHover
            text="删除标记"
            placement="right-start"
            content={() => (
              <NButton text focusable={false} onClick={() => removeHighlight(view, range)}>
                <SVGIcon size={26} name="ic_fluent_delete_24_filled" />
              </NButton>
            )}
          />
          <TextHover
            text="复制文本"
            placement="right-start"
            content={() => (
              <NButton text focusable={false} onClick={() => copyText(range)}>
                <SVGIcon size={26} name="ic_fluent_copy_24_filled" />
              </NButton>
            )}
          />
        </div>
      )

      event.stopPropagation()
    }

    const getHighlights = async (index?: number) => {
      if (bookData.id) {
        const result = await dbChannel.getHighlightList(bookData.id, index)

        highlightData.list = result
      }
    }

    const updateHighlights = async (view: View, list?: HighlightData[]) => {
      if (bookData.id) {
        const index = view.section.index

        if (highlightMap.has(index)) {
          return
        }

        const ranges: Range[] = []
        highlightMap.set(index, ranges)

        try {
          if (!list) {
            list = await dbChannel.getHighlightList(bookData.id, index)
          }

          await view.loaded

          await new Promise(resolve => requestAnimationFrame(resolve))

          if (!bookData.renderer || bookData.renderer.views.indexOf(view) === -1) {
            return
          }

          for (const item of list) {
            const range = view.cfiToRange(item.location)

            if (range) {
              view.mark(range, 'book-mark-highlight', [['click', handleClickHighligh]])
              ranges.push(range)
              highlightIdMap.set(range, item.id)
            }
          }
        } catch {
          for (const range of ranges) {
            view.unMark(range)
            highlightIdMap.delete(range)
          }
          highlightMap.delete(index)
        }
      }
    }

    const addHighlight = async () => {
      if (bookData.id && selectionData) {
        const { view, selection, range } = selectionData
        const location = view.rangeToCFI(range) as string

        const data = {
          bookId: bookData.id,
          section: view.section.index,
          fragment: selection.toString().slice(0, 64).trim(),
          location,
          createTime: Math.floor(Date.now() / 1000)
        }
        try {
          const result = await dbChannel.insertHighlight(data)

          highlightData.list.unshift({ id: result.id, ...data })

          view.mark(range, 'book-mark-highlight', [['click', handleClickHighligh]])

          const ranges = highlightMap.get(view.section.index)
          if (ranges) {
            ranges.push(range)
            highlightIdMap.set(range, result.id)
          }

          handleCancelSelect()
        } catch (error) {
          message.warning('当前位置已存在标记')
        }
      }
    }

    const clearHighlight = (view: View) => {
      const index = view.section.index
      const ranges = highlightMap.get(index)

      if (ranges) {
        for (const range of ranges) {
          view.unMark(range)
          highlightIdMap.delete(range)
        }
      }

      highlightMap.delete(index)
    }

    const handleUpdateLocation = (location: LocationData) => {
      if (bookData.id && location.cfi !== bookData.location.cfi) {
        if (location.percentage < 0) {
          dbChannel.updateBook(bookData.id, {
            location: location.cfi
          })
        } else {
          dbChannel.updateBook(bookData.id, {
            location: location.cfi,
            percentage: location.percentage
          })
        }
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

    const handleHighlighChange = (data: Partial<HighlightDisplayData>) => {
      if (data.all !== undefined) {
        if (data.all) {
          getHighlights()
        } else if (bookData.renderer) {
          bookData.renderer.views.forEach(view => getHighlights(view.section.index))
        }
      }

      if (data.show !== undefined) {
        if (bookData.renderer) {
          bookData.renderer.views.forEach(view => {
            if (data.show) {
              updateHighlights(view)
            } else {
              clearHighlight(view)
            }
          })
        }
      }

      Object.assign(highlightData, data)
    }

    let spinTaskHandle: NodeJS.Timeout | null = null

    const handleBeforeRender = async (view: View) => {
      spinTaskHandle = setTimeout(() => {
        spinTaskHandle = null
        isLoading.value = true
      }, 200)

      if (highlightData.show && !highlightData.all) {
        await getHighlights(view.section.index)
        updateHighlights(view, highlightData.list)
      } else if (highlightData.show) {
        updateHighlights(view)
      }
    }

    const handleRendered = () => {
      if (spinTaskHandle) {
        clearTimeout(spinTaskHandle)
      }

      isLoading.value = false
    }

    const handleBeforeUnload = (view: View) => {
      clearHighlight(view)
    }

    const updateAccessTime = () => {
      if (bookData.id) {
        dbChannel.updateBook(bookData.id, {
          accessTime: Math.floor(Date.now() / 1000)
        })
      }
    }

    let shouldUpdateReadingTime = true

    const updateReadingTime = () => {
      if (bookData.id && shouldUpdateReadingTime) {
        bookData.readingTime += 1

        dbChannel.updateBook(bookData.id, {
          readingTime: bookData.readingTime
        })

        setTimeout(updateReadingTime, 1000)
      }
    }

    const openBook: () => Promise<{
      id: number | bigint
      book: Book
      location?: string
      percentage?: number
      readingTime?: number
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

        const bookData: Omit<BookData, 'id'> = {
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

        const result = await dbChannel.insertBook(bookData)

        return {
          id: result.id,
          book,
          location: result.location,
          percentage: result.percentage,
          readingTime: result.readingTime
        }
      } else if (id) {
        const result = await dbChannel.getBookById(BigInt(id))

        if (result) {
          const book = new ePub.Book(Buffer.from(result.file as Buffer), true, {
            path: dumpPath
          })

          return {
            id: BigInt(id),
            book,
            location: result.location,
            percentage: result.percentage,
            readingTime: result.readingTime
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
          const { id, book, location, readingTime } = result

          bookData.id = id
          bookData.book = markRaw(book)
          bookData.renderer = markRaw(new ePub.PaginationRenderer(bookData.book))
          bookData.readingTime = readingTime || 0

          await bookData.book.opened

          const { title, creator } = book.package.metadata

          bookStore.setBookMeta(title || '', creator || '')

          bookData.metadata = bookData.book.package.metadata

          bookData.renderer.attachTo(containerRef.value)
          bookData.renderer.display(location)

          bookData.renderer.hooks.location.register(handleUpdateLocation)
          bookData.renderer.hooks.select.register(handleSelect)
          bookData.renderer.hooks.cancelSelect.register(handleCancelSelect)
          bookData.renderer.hooks.beforeRender.register(handleBeforeRender)
          bookData.renderer.hooks.rendered.register(handleRendered)
          bookData.renderer.hooks.beforeUnload.register(handleBeforeUnload)
          bookData.renderer.stage.hooks.resize.register(handleCancelSelect)

          updateAccessTime()

          updateReadingTime()

          if (highlightData.all) {
            getHighlights()
          }

          getBookmarks()
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

      bookData.id = null

      shouldUpdateReadingTime = false

      bookStore.clearBookMeta()
    })

    watchEffect(() => {
      if (bookData.renderer && layoutStore.theme.common) {
        const ruleId = 'epub-reader-read-page'

        bookData.renderer.setStylesheetRule(`*::selection, #${ruleId}`, {
          'background-color':
            layoutStore.themeData.mode === 'dark'
              ? `${layoutStore.theme.common.placeholderColor} !important`
              : ''
        })
        bookData.renderer.setStylesheetRule(`*, #${ruleId}`, {
          color:
            layoutStore.themeData.mode === 'dark'
              ? `${layoutStore.theme.common.textColor2} !important`
              : ''
        })
      }
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

    return () => (
      <div ref={pageRef} class="reader-page" onClick={handleCancelSelect}>
        <NPopover
          to={pageRef.value}
          show={popoverData.show}
          x={popoverData.x}
          y={popoverData.y}
          trigger="manual"
          placement="bottom"
        >
          {popoverData.content && popoverData.content()}
        </NPopover>
        {isLoading.value && <NSpin class="reader-page-loading-mask" size="large" />}
        <SideBar
          renderer={bookData.renderer}
          highlight={highlightData}
          bookmark={bookmarkData}
          onHighlightChange={handleHighlighChange}
          onRemoveBookmark={removeBookmark}
        />
        <div ref={containerRef} class="reader-page-container">
          <div class="top-bar">
            <div class="left">
              <div class="progress">
                {bookData.location.percentage >= 0 &&
                  `${(bookData.location.percentage * 100).toFixed(2)}%`}
              </div>
            </div>
            <div class="center">{bookData.chapter}</div>
            <div class="right">
              <TextHover
                text="添加书签"
                content={() => (
                  <NButton text focusable={false} onClick={addBookmark}>
                    <SVGIcon size={24} name="ic_fluent_bookmark_24_filled" />
                  </NButton>
                )}
              />
              <TextHover
                text="返回首页"
                content={() => (
                  <NButton text focusable={false} onClick={() => router.replace({ name: 'START' })}>
                    <SVGIcon size={24} name="ic_fluent_home_24_filled" />
                  </NButton>
                )}
              />
              <TextHover
                text="设置"
                content={() => (
                  <NButton text focusable={false} onClick={() => settingPanelInst.value?.show()}>
                    <SVGIcon size={24} name="ic_fluent_settings_24_filled" />
                  </NButton>
                )}
              />
              <TextHover
                text={isFullScreen.value ? '取消全屏' : '全屏'}
                content={() => (
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
                )}
              />
            </div>
          </div>
          <div class="arrow prev" onClick={prevPage}>
            <SVGIcon size={36} name="ic_fluent_ios_arrow_left_24_filled" />
          </div>
          <div class="arrow next" onClick={nextPage}>
            <SVGIcon size={36} name="ic_fluent_ios_arrow_right_24_filled" />
          </div>
        </div>
        <SettingPanel ref={settingPanelInst} renderer={bookData.renderer} />
      </div>
    )
  }
})
