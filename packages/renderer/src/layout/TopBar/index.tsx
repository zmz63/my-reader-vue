import { defineComponent, onBeforeMount, onUnmounted, ref } from 'vue'
import { NButton, NSpace } from 'naive-ui'
import SearchBar from '@/components/SearchBar'
import SvgIcon from '@/components/SvgIcon'
import { WindowOperationType } from '@packages/global'
import './index.scss'

const { operateWindow, listenWindowMaximize } = window.electron.windowUtil

export default defineComponent({
  setup() {
    const isMaximized = ref(false)

    let handler: () => void

    onBeforeMount(() => {
      handler = listenWindowMaximize(value => {
        isMaximized.value = value
      })
    })

    onUnmounted(() => {
      handler()
    })

    return () => (
      <div class="top-bar">
        <div class="left">
          <SearchBar />
        </div>
        <div class="right">
          <div class="divider"></div>
          <NSpace wrapItem={false} align="center">
            <NButton
              quaternary
              size="tiny"
              focusable={false}
              onClick={() => operateWindow(WindowOperationType.MINIMIZE)}
            >
              <SvgIcon size={16} name="ic_fluent_subtract_24_regular" />
            </NButton>
            <NButton
              quaternary
              size="tiny"
              focusable={false}
              onClick={() => operateWindow(WindowOperationType.MAXIMIZE)}
            >
              {isMaximized.value ? (
                <SvgIcon size={16} name="ic_fluent_square_multiple_24_regular" />
              ) : (
                <SvgIcon size={16} name="ic_fluent_maximize_24_regular" />
              )}
            </NButton>
            <NButton
              quaternary
              size="tiny"
              focusable={false}
              onClick={() => operateWindow(WindowOperationType.CLOSE)}
            >
              <SvgIcon size={16} name="ic_fluent_dismiss_24_regular" />
            </NButton>
          </NSpace>
        </div>
      </div>
    )
  }
})
