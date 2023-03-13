import { defineComponent, ref } from 'vue'
import { NButton, NInput } from 'naive-ui'
import SvgIcon from '@/components/SvgIcon'
import './index.scss'

type DisplayMode = 'list' | 'card'

export default defineComponent({
  setup() {
    const displayMode = ref<DisplayMode>('card')

    const handleSwitchDisplayMode = (mode: DisplayMode) => {
      if (mode === displayMode.value) {
        return
      }

      displayMode.value = mode
    }

    return () => (
      <div class="recent-page">
        <div class="recent-page-header">
          <NInput class="search-wrapper">
            {{
              prefix: () => (
                <SvgIcon class="search-prefix" size={20} name="ic_fluent_search_24_regular" />
              )
            }}
          </NInput>
          <div class="switch-wrapper">
            <NButton text focusable={false} onClick={() => handleSwitchDisplayMode('card')}>
              <SvgIcon
                size={24}
                name={
                  displayMode.value === 'card'
                    ? 'ic_fluent_textbox_align_bottom_rotate_90_24_filled'
                    : 'ic_fluent_textbox_align_bottom_rotate_90_24_regular'
                }
              />
            </NButton>
            <NButton text focusable={false} onClick={() => handleSwitchDisplayMode('list')}>
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
        <div class="recent-page-container">
          <div>hello</div>
        </div>
      </div>
    )
  }
})
