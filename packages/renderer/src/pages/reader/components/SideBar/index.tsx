import {
  type PropType,
  type Raw,
  defineComponent,
  markRaw,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref
} from 'vue'
import { NButton, NInput, NScrollbar } from 'naive-ui'
import { clamp, debounce } from 'lodash'
import type { Book, PaginationRenderer, SearchResult, TocItem } from '@preload/epub'
import type { HighlightData } from '@preload/channel/db'
import SVGIcon from '@/components/SVGIcon'
import TextHover from '@/components/TextHover'
import './index.scss'
import { format } from 'date-fns'

type SideBarKey = 'navigation' | 'search' | 'highlight'

type SideBarItem = {
  label: string
  row?: boolean
  header?: () => JSX.Element
  content: () => JSX.Element
}

export type HighlightDisplayData = {
  show: boolean
  list: HighlightData[]
  all: boolean
}

const sideBarProps = {
  book: {
    type: [Object, null] as PropType<Book | null>,
    required: true
  },
  renderer: {
    type: [Object, null] as PropType<PaginationRenderer | null>,
    required: true
  },
  highlight: {
    type: Object as PropType<HighlightDisplayData>,
    required: true
  }
} as const

export default defineComponent({
  props: sideBarProps,
  emits: {
    translate(value: number) {
      return typeof value === 'number'
    },
    highlightChange(value: Partial<HighlightDisplayData>) {
      return typeof value === 'object'
    }
  },
  setup(props, { emit }) {
    const sideBarRef = ref<HTMLDivElement>(undefined as unknown as HTMLDivElement)

    const dividerRef = ref<HTMLDivElement>(undefined as unknown as HTMLDivElement)

    let dragging = false

    let lastWidth = 200

    const translate = (width = lastWidth) => {
      sideBarRef.value.style.width = `${width}px`
      lastWidth = width

      if (sideBarData.show) {
        sideBarRef.value.style.translate = '0 0'
        emit('translate', width)
      } else {
        sideBarRef.value.style.translate = `${-width}px 0`
        emit('translate', 0)
      }
    }

    const handleMousemove = (event: MouseEvent) => {
      if (event.clientX < 200) {
        if (event.clientX < 100) {
          sideBarData.show = false
          sideBarData.key = ''
        }
        translate(200)
      } else if (window.innerWidth - event.clientX < 600) {
        translate(window.innerWidth - 600)
      } else {
        translate(event.clientX)
      }
    }

    const handleMouseenter = () => {
      dividerRef.value.style.backgroundColor = '#999'
    }

    const handleMouseleave = () => {
      if (!dragging) {
        dividerRef.value.style.backgroundColor = ''
      }
    }

    const handleMousedown = () => {
      dragging = true

      document.addEventListener('mousemove', handleMousemove)

      dividerRef.value.style.backgroundColor = '#999'

      for (const item of document.querySelectorAll('iframe')) {
        item.style.pointerEvents = 'none'
      }
    }

    const handleMouseup = (event: MouseEvent) => {
      if (dragging) {
        dragging = false

        document.removeEventListener('mousemove', handleMousemove)

        for (const item of document.querySelectorAll('iframe')) {
          item.style.pointerEvents = ''
        }

        if (event.currentTarget !== dividerRef.value) {
          dividerRef.value.style.backgroundColor = ''
        } else {
          event.stopPropagation()
        }
      }
    }

    onMounted(() => {
      document.addEventListener('mouseup', handleMouseup)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mouseup', handleMouseup)
    })

    const sideBarData = reactive({
      show: false,
      key: '' as SideBarKey | ''
    })

    const sideBarKeys: SideBarKey[] = ['navigation', 'search', 'highlight']

    const createNavigationContent = () => {
      const generateNode = (items: TocItem[], deep = 0) =>
        items.map(item => (
          <div style={`padding-left: ${deep * 4}px`}>
            <div
              class="navigation-item"
              onClick={event => {
                props.renderer?.display(item.href)
                event.stopPropagation()
              }}
            >
              {item.label}
            </div>
            {item.subitems.length ? <div>{generateNode(item.subitems, deep + 1)}</div> : null}
          </div>
        ))

      return {
        content: () => (
          <NScrollbar class="navigation-content">
            {generateNode(props.book?.navigation.list || [])}
          </NScrollbar>
        )
      }
    }

    const createSearchContent = () => {
      const keyword = ref('')

      const searchResult = ref<[number, Raw<Range>[]][]>([])

      const indexMap: Map<number, number> = new Map()

      let generator: Generator<SearchResult, void, unknown>

      let taskHandle: number | null = null

      const handleSearch = debounce((content: string) => {
        searchResult.value = []
        indexMap.clear()

        if (taskHandle !== null) {
          cancelAnimationFrame(taskHandle)
        }

        if (generator) {
          generator.return()
        }

        if (props.renderer) {
          generator = props.renderer.searcher.search(content, 100)
          let result = generator.next()

          const task = () => {
            taskHandle = requestAnimationFrame(() => {
              taskHandle = null

              if (!result.done) {
                for (const [index, ranges] of result.value) {
                  if (indexMap.has(index)) {
                    searchResult.value[indexMap.get(index) as number][1].push(
                      ...ranges.map(range => markRaw(range))
                    )
                  } else {
                    indexMap.set(index, searchResult.value.length)
                    searchResult.value.push([index, ranges.map(range => markRaw(range))])
                  }
                }

                result = generator.next()

                task()
              }
            })
          }

          task()
        }
      }, 300)

      const splitResult = (range: Range, index: number) => {
        if (range.endOffset <= range.startOffset) {
          return
        }

        const text = range.startContainer.textContent as string
        const size = clamp(4 * (4 - Math.log(range.endOffset - range.startOffset)), 1, 12)
        const offsetLeft = Math.round(size / 3)
        const offsetRight = Math.round((size * 2) / 3)
        const left = range.startOffset > offsetLeft ? range.startOffset - offsetLeft : 0
        const right =
          text.length - range.endOffset > offsetRight ? range.endOffset + offsetRight : text.length

        return (
          <div class="result-item" onClick={() => props.renderer?.display(index, range)}>
            {`${left > 0 ? '…' : ''}${text.slice(left, range.startOffset)}`}
            <b>{text.slice(range.startOffset, range.endOffset)}</b>
            {`${text.slice(range.endOffset, right)}${right < text.length ? '…' : ''}`}
          </div>
        )
      }

      return {
        header: () => (
          <div class="search-header">
            <NInput
              size="small"
              placeholder="搜索"
              v-model:value={keyword.value}
              onInput={handleSearch}
            />
            <div class="result">
              {searchResult.value.length
                ? `找到 ${searchResult.value.reduce(
                    (prev, [, ranges]) => prev + ranges.length,
                    0
                  )} 个结果`
                : null}
            </div>
          </div>
        ),
        content: () => (
          <NScrollbar class="search-content">
            {searchResult.value.map(([index, ranges]) => (
              <div>{ranges.map(range => splitResult(range, index))}</div>
            ))}
          </NScrollbar>
        )
      }
    }

    const crateHighlightContent = () => ({
      row: true,
      header: () => (
        <div class="highlight-header">
          <TextHover
            text={props.highlight.all ? '全部' : '本章'}
            content={() => (
              <NButton
                class="icon-button"
                quaternary
                size="tiny"
                focusable={false}
                onClick={() => emit('highlightChange', { all: !props.highlight.all })}
              >
                <SVGIcon
                  size={18}
                  name={
                    props.highlight.all
                      ? 'ic_fluent_filter_dismiss_24_filled'
                      : 'ic_fluent_filter_24_filled'
                  }
                />
              </NButton>
            )}
          />
          <TextHover
            text={props.highlight.show ? '显示高亮' : '隐藏高亮'}
            content={() => (
              <NButton
                class="icon-button"
                quaternary
                size="tiny"
                focusable={false}
                onClick={() => emit('highlightChange', { show: !props.highlight.show })}
              >
                <SVGIcon
                  size={18}
                  name={
                    props.highlight.show
                      ? 'ic_fluent_eye_show_24_filled'
                      : 'ic_fluent_eye_hide_24_filled'
                  }
                />
              </NButton>
            )}
          />
        </div>
      ),
      content: () => (
        <NScrollbar class="highlight-content">
          {props.highlight.list.map(item => (
            <div class="highlight-item">
              <div class="fragment" onClick={() => props.renderer?.display(item.location)}>
                {item.fragment}
              </div>
              <div class="ellipsis date">{format(item.createTime * 1000, 'yyyy-MM-dd HH:mm')}</div>
            </div>
          ))}
        </NScrollbar>
      )
    })

    const sideBarItems = reactive<Record<SideBarKey, SideBarItem>>({
      navigation: {
        label: '导航',
        ...createNavigationContent()
      },
      search: {
        label: '查找',
        ...createSearchContent()
      },
      highlight: {
        label: '高亮',
        ...crateHighlightContent()
      }
    })

    const switchSideBar = (key: SideBarKey) => {
      if (sideBarData.show && key === sideBarData.key) {
        sideBarData.show = false
        sideBarData.key = ''
      } else {
        sideBarData.show = true
        sideBarData.key = key
      }

      translate()
    }

    return () => (
      <div ref={sideBarRef} class="reader-page-side-bar">
        {sideBarKeys.map(key => (
          <TextHover
            text={sideBarItems[key].label}
            placement="right"
            content={() => (
              <div
                class={`tag${key === sideBarData.key ? ' active' : ''}`}
                onClick={() => switchSideBar(key)}
              >
                <SVGIcon size={18} name={`ic_fluent_${key}_24_filled`} />
              </div>
            )}
          />
        ))}
        <div
          ref={dividerRef}
          class="divider"
          onMouseenter={handleMouseenter}
          onMouseleave={handleMouseleave}
          onMousedown={handleMousedown}
          onMouseup={handleMouseup}
        />
        <div class="content-wrapper">
          {sideBarData.key && (
            <>
              <div class={`content-header${sideBarItems[sideBarData.key].row ? ' row' : ''}`}>
                <div class="label">{sideBarItems[sideBarData.key].label}</div>
                {sideBarItems[sideBarData.key].header &&
                  (sideBarItems[sideBarData.key].header as () => JSX.Element)()}
              </div>
              <div class="content-view">{sideBarItems[sideBarData.key].content()}</div>
            </>
          )}
        </div>
      </div>
    )
  }
})
