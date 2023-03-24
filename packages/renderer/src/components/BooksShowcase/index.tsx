import { type PropType, defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NScrollbar } from 'naive-ui'
import type { BookMeta } from '@preload/channel/db'
import SVGIcon from '@/components/SVGIcon'
import BookCards from '../BookCards'
import BookList from '@/components/BookList'
import './index.scss'

export type DisplayMode = 'card' | 'list'

const booksShowcaseProps = {
  list: {
    type: Array as PropType<BookMeta[]>,
    required: true
  }
} as const

export default defineComponent({
  props: booksShowcaseProps,
  setup(props, { slots }) {
    const router = useRouter()

    const displayMode = ref<DisplayMode>('card')

    const switchDisplayMode = (mode: DisplayMode) => {
      if (mode === displayMode.value) {
        return
      }

      displayMode.value = mode
    }

    const openBook = (id: number | bigint) => {
      router.push({
        name: 'READER',
        query: {
          id: id.toString()
        }
      })
    }

    const booksRenderer = () => {
      switch (displayMode.value) {
        case 'card':
          return <BookCards list={props.list} onOpen={openBook} />
        case 'list':
          return <BookList list={props.list} onOpen={openBook} />
        default:
          break
      }
    }

    return () => (
      <div class="books-showcase">
        <div class="books-showcase-header">
          <div class="slot-wrapper">{slots.header ? slots.header() : null}</div>
          <div class="switch-wrapper">
            <NButton text focusable={false} onClick={() => switchDisplayMode('card')}>
              <SVGIcon
                size={24}
                name={
                  displayMode.value === 'card'
                    ? 'ic_fluent_textbox_align_bottom_rotate_90_24_filled'
                    : 'ic_fluent_textbox_align_bottom_rotate_90_24_regular'
                }
              />
            </NButton>
            <NButton text focusable={false} onClick={() => switchDisplayMode('list')}>
              <SVGIcon
                size={24}
                name={
                  displayMode.value === 'list'
                    ? 'ic_fluent_apps_list_24_filled'
                    : 'ic_fluent_apps_list_24_regular'
                }
              />
            </NButton>
          </div>
        </div>
        <NScrollbar class="books-showcase-body">
          <div class="books-container">{booksRenderer()}</div>
        </NScrollbar>
      </div>
    )
  }
})
