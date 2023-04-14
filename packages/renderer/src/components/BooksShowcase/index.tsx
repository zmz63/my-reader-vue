import { type PropType, defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NScrollbar, NSpin, useMessage } from 'naive-ui'
import type { BookMeta } from '@preload/channel/db'
import SVGIcon from '@/components/SVGIcon'
import TextHover from '@/components/TextHover'
import BookCards from '@/components/BookCards'
import BookList from '@/components/BookList'
import './index.scss'

export type DisplayMode = 'list' | 'card'

const booksShowcaseProps = {
  list: {
    type: Array as PropType<BookMeta[]>,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
} as const

export default defineComponent({
  props: booksShowcaseProps,
  emits: {
    update() {
      return true
    }
  },
  setup(props, { emit, slots }) {
    const router = useRouter()

    const message = useMessage()

    const displayMode = ref<DisplayMode>(
      (localStorage.getItem('SHOWCASE-DISPLAY-MODE') || 'list') as DisplayMode
    )

    const switchDisplayMode = (mode: DisplayMode) => {
      if (mode === displayMode.value) {
        return
      }

      displayMode.value = mode

      localStorage.setItem('SHOWCASE-DISPLAY-MODE', mode)
    }

    const openBook = (id: number | bigint) => {
      router.push({
        name: 'READER',
        query: { id: id.toString() }
      })
    }

    const deleteBook = async (id: number | bigint) => {
      try {
        await dbChannel.deleteBook(id)

        emit('update')

        message.success('删除成功')
      } catch (error) {
        message.error('删除失败')
      }
    }

    const booksRenderer = () => {
      switch (displayMode.value) {
        case 'list':
          return <BookList list={props.list} onOpen={openBook} onDelete={deleteBook} />
        case 'card':
          return <BookCards list={props.list} onOpen={openBook} onDelete={deleteBook} />
        default:
          break
      }
    }

    return () => (
      <div class="books-showcase">
        <div class="books-showcase-header">
          <div class="slot-wrapper">{slots.header && slots.header()}</div>
          <div class="switch-wrapper">
            <TextHover
              text="列表"
              content={() => (
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
              )}
            />
            <TextHover
              text="卡片"
              content={() => (
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
              )}
            />
          </div>
        </div>
        {props.loading && <NSpin class="books-showcase-loading-mask" size="large" />}
        {props.list.length || props.loading ? (
          <NScrollbar class="books-showcase-body">
            <div class="books-container">{booksRenderer()}</div>
            {slots.bottom && slots.bottom()}
          </NScrollbar>
        ) : (
          slots.empty && slots.empty()
        )}
        <div class="books-showcase-footer">{slots.footer && slots.footer()}</div>
      </div>
    )
  }
})
