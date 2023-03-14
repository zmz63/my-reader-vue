import { type PropType, defineComponent, ref } from 'vue'
import { NButton } from 'naive-ui'
import SvgIcon from '@/components/SvgIcon'
import './index.scss'

export type DisplayMode = 'list' | 'card'

const booksShowcaseProps = {
  list: {
    type: Array as PropType<string[]>,
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
        <div class="books-showcase-body">
          {displayMode.value === 'card' ? <div>card</div> : <div>list</div>}
        </div>
      </div>
    )
  }
})
