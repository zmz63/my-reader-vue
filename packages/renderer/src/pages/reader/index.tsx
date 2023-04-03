import { type Raw, defineComponent, markRaw, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NSpin } from 'naive-ui'
import { debounce } from 'lodash'
import type { Book, LocationData, Metadata, PaginationRenderer, TocItem, View } from '@preload/epub'
import type { BookData, HighlightData } from '@preload/channel/db'
import { useLayoutStore } from '@/stores/layout'
import SVGIcon from '@/components/SVGIcon'
import TextHover from '@/components/TextHover'
import SideBar, { type HighlightDisplayData } from './components/SideBar'
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

      layoutStore.popoverData.show = true
      layoutStore.popoverData.x = x
      layoutStore.popoverData.y = y
      layoutStore.popoverData.content = () => (
        <div class="popover-content">
          <TextHover
            text="添加高亮"
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

      layoutStore.popoverData.show = false
    }

    const copyText = (range?: Range) => {
      if (range) {
        appChannel.copyText(range.toString())

        layoutStore.popoverData.show = false
      } else if (selectionData) {
        const { selection } = selectionData

        appChannel.copyText(selection.toString())

        handleCancelSelect()
      }
    }

    const highlightData = reactive({
      show: true,
      list: [] as HighlightData[],
      all: false
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

            layoutStore.popoverData.show = false

            break
          }
        }
      }
    }

    const handleClickHighligh = (event: MouseEvent, view: View, range: Range) => {
      layoutStore.popoverData.show = true
      layoutStore.popoverData.x = event.x
      layoutStore.popoverData.y = event.y
      layoutStore.popoverData.content = () => (
        <div class="popover-content">
          <TextHover
            text="删除高亮"
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

          console.log('list', list)

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
        const result = await dbChannel.insertHighlight(data)

        highlightData.list.unshift({ id: result.id, ...data })

        view.mark(range, 'book-mark-highlight', [['click', handleClickHighligh]])

        const ranges = highlightMap.get(view.section.index)
        if (ranges) {
          ranges.push(range)
          highlightIdMap.set(range, result.id)
        }

        handleCancelSelect()
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

        layoutStore.topBarSlot = () => (
          <div class="top-bar-slot">
            <div class="ellipsis">{title}</div>
            <div class="divider">-</div>
            <div class="ellipsis">{creator}</div>
          </div>
        )

        const result = await dbChannel.insertBook(bookData)

        return {
          id: result.id,
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
      layoutStore.popoverData.to = pageRef.value

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
          bookData.renderer.hooks.beforeUnload.register(handleBeforeUnload)
          bookData.renderer.stage.hooks.resize.register(handleCancelSelect)

          updateAccessTime()

          if (highlightData.all) {
            getHighlights()
          }
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
        <SideBar
          book={bookData.book}
          renderer={bookData.renderer}
          highlight={highlightData}
          onTranslate={handleSideBarTranslate}
          onHighlightChange={handleHighlighChange}
        />
        <div ref={containerRef} class="reader-page-container">
          <div class="top-bar">
            <div class="left"></div>
            <div class="center">{bookData.chapter}</div>
            <div class="right">
              <TextHover
                text="返回首页"
                content={() => (
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
                )}
              />
              <TextHover
                text="设置"
                content={() => (
                  <NButton text focusable={false}>
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
      </div>
    )
  }
})
