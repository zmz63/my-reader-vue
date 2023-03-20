import { type PropType, defineComponent, ref } from 'vue'
import { NButton, NScrollbar } from 'naive-ui'
import type { BookMeta } from '@main/db/server'
import SvgIcon from '@/components/SvgIcon'
import Image from '@/components/Image'
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
    const displayMode = ref<DisplayMode>('card')

    const switchDisplayMode = (mode: DisplayMode) => {
      if (mode === displayMode.value) {
        return
      }

      displayMode.value = mode
    }

    const booksRenderer = () => {
      switch (displayMode.value) {
        case 'card':
          return (
            <div class="card-wrapper">
              {props.list.map(item => (
                <div class="card-item" key={item.rowid}>
                  <Image class="cover-wrapper" imageClass="cover" data={item.cover}>
                    {{
                      placeholder: () => (
                        <div class="cover-placeholder">
                          <div class="cover-title">{item.title}</div>
                        </div>
                      )
                    }}
                  </Image>
                  <div class="title-wrapper">
                    <div class="title">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        case 'list':
          return (
            <div class="list">
              {props.list.map(item => (
                <div class="list-item" key={item.rowid}>
                  <Image class="cover-wrapper" imageClass="cover" data={item.cover}>
                    {{
                      placeholder: () => (
                        <div class="cover-placeholder">
                          <div class="cover-title">{item.title}</div>
                        </div>
                      )
                    }}
                  </Image>
                  <div class="meta-wrapper">
                    <div class="top">
                      <div class="text title">{item.title}</div>
                      <div class="text creator">{item.creator ? item.creator : '佚名'}</div>
                      <div class="text publisher">
                        {item.publisher ? item.publisher : '未知出版社'}
                      </div>
                      <div class="description">
                        {item.description ? item.description : '暂无简介'}
                      </div>
                    </div>
                    <div class="bottom">
                      <div>hello</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        default:
          break
      }
    }

    return () => (
      <div class="books-showcase">
        <div class="books-showcase-header">
          <div class="slot-wrap">{slots.header ? slots.header() : null}</div>
          <div class="switch-wrapper">
            <NButton text focusable={false} onClick={() => switchDisplayMode('card')}>
              <SvgIcon
                size={24}
                name={
                  displayMode.value === 'card'
                    ? 'ic_fluent_textbox_align_bottom_rotate_90_24_filled'
                    : 'ic_fluent_textbox_align_bottom_rotate_90_24_regular'
                }
              />
            </NButton>
            <NButton text focusable={false} onClick={() => switchDisplayMode('list')}>
              <SvgIcon
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
