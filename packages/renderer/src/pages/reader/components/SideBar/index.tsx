import { type PropType, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { NScrollbar } from 'naive-ui'
import type { Book, Metadata, PaginationRenderer, TocItem } from '@preload/epub'
import SVGIcon from '@/components/SVGIcon'
import Search from '@/components/Search'
import './index.scss'

type SideBarKey = 'navigation' | 'search' | 'highlight' | 'note'

type SideBarItem = {
  label: string
  header?: () => JSX.Element
  content: () => JSX.Element | null
}

const sideBarProps = {
  book: {
    type: [Object, null] as PropType<Book | null>,
    required: true
  },
  renderer: {
    type: [Object, null] as PropType<PaginationRenderer | null>,
    required: true
  }
}

export default defineComponent({
  props: sideBarProps,
  emits: {
    translate(value: number) {
      return typeof value === 'number'
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

    const sideBarKeys: SideBarKey[] = ['navigation', 'search', 'highlight', 'note']

    const sideBarItems: Record<SideBarKey, SideBarItem> = {
      navigation: {
        label: '导航',
        content() {
          const navigation = props.book?.navigation

          if (!navigation) {
            return null
          }

          const redirectPage = (item: TocItem) => {
            props.renderer?.display(item.href)
          }

          const generateNode = (items: TocItem[], deep = 0) =>
            items.map(item => (
              <div style={`padding-left: ${deep * 4}px`} onClick={() => redirectPage(item)}>
                <div class="navigation-item">{item.label}</div>
                {item.subitems.length ? <div>{generateNode(item.subitems, deep + 1)}</div> : null}
              </div>
            ))

          return <NScrollbar class="navigation-content">{generateNode(navigation.list)}</NScrollbar>
        }
      },
      search: {
        label: '查找',
        header() {
          return (
            <div class="search-header">
              <Search size="small" />
            </div>
          )
        },
        content() {
          return <NScrollbar class="search-content"></NScrollbar>
        }
      },
      highlight: {
        label: '高亮',
        content() {
          return <div>hello</div>
        }
      },
      note: {
        label: '笔记',
        content() {
          return <div>hello</div>
        }
      }
    }

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
          <div
            class={`tag${key === sideBarData.key ? ' active' : ''}`}
            onClick={() => switchSideBar(key)}
          >
            <SVGIcon size={18} name={`ic_fluent_${key}_24_filled`} />
          </div>
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
          {sideBarData.key ? (
            <>
              <div class="content-header">
                <div class="label">{sideBarItems[sideBarData.key].label}</div>
                {sideBarItems[sideBarData.key].header
                  ? (sideBarItems[sideBarData.key].header as () => JSX.Element)()
                  : null}
              </div>
              <div class="content-view">{sideBarItems[sideBarData.key].content()}</div>
            </>
          ) : null}
        </div>
      </div>
    )
  }
})
