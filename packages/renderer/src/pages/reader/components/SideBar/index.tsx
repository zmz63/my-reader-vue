import { type PropType, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { NScrollbar } from 'naive-ui'
import type { Book, Metadata, PaginationRenderer, TocItem } from '@preload/epub'
import SVGIcon from '@/components/SVGIcon'
import './index.scss'

type SideBarKey = 'navigation' | 'search' | 'highlight' | 'note'

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

    const translate = (width = 200) => {
      sideBarRef.value.style.width = `${width}px`

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
      dividerRef.value.style.width = '4px'
      dividerRef.value.style.backgroundColor = 'blue'
    }

    const handleMouseleave = () => {
      if (!dragging) {
        dividerRef.value.style.width = '2px'
        dividerRef.value.style.backgroundColor = ''
      }
    }

    const handleMousedown = () => {
      dragging = true

      document.addEventListener('mousemove', handleMousemove)

      dividerRef.value.style.width = '4px'
      dividerRef.value.style.backgroundColor = 'blue'

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
          dividerRef.value.style.width = '2px'
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
      key: '' as SideBarKey | '',
      content: null as JSX.Element | null
    })

    const sideBarKeys: SideBarKey[] = ['navigation', 'search', 'highlight', 'note']

    const createNavigation = () => {
      const navigation = props.book?.navigation

      if (!navigation) {
        return null
      }

      const redirectPage = (item: TocItem) => {
        // TODO
        console.log(item)
      }

      const generateNode = (items: TocItem[], deep = 0) =>
        items.map(item => (
          <div
            class="navigation-item"
            style={`padding-left: ${deep * 4}px`}
            onClick={() => redirectPage(item)}
          >
            <div>{item.label}</div>
            {item.subitems.length ? <div>{generateNode(item.subitems, deep + 1)}</div> : null}
          </div>
        ))

      return <NScrollbar class="navigation-wrap">{generateNode(navigation.list)}</NScrollbar>
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

      switch (sideBarData.key) {
        case 'navigation':
          sideBarData.content = createNavigation()
          break
        case 'search':
          sideBarData.content = <div>search</div>
          break
        case 'highlight':
          sideBarData.content = <div>highlight</div>
          break
        case 'note':
          sideBarData.content = <div>note</div>
          break
        default:
          sideBarData.content = null
          break
      }
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
        <div class="content-wrapper">{sideBarData.content}</div>
      </div>
    )
  }
})
