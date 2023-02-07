import { defineComponent, onBeforeMount, onUnmounted, ref } from 'vue'
import { NButton, NSpace } from 'naive-ui'
import SvgIcon from '@/components/SvgIcon'
import { WindowControlType } from '@packages/global'
import './index.scss'

export default defineComponent({
  setup() {
    const isOnTop = ref(false)
    const isMaximized = ref(false)

    let onTopHandler: () => void
    let maximizeHandler: () => void

    onBeforeMount(() => {
      onTopHandler = windowIPC.addWindowStateListener('on-top', value => {
        isOnTop.value = value
      })
      maximizeHandler = windowIPC.addWindowStateListener('maximize', value => {
        isMaximized.value = value
      })
    })

    onUnmounted(() => {
      onTopHandler()
      maximizeHandler()
    })

    return () => (
      <div class="top-bar">
        <div class="left">Hello</div>
        <div class="right">
          <div class="divider"></div>
          <NSpace
            style={{ width: '160px' }}
            size={0}
            wrapItem={false}
            align="center"
            justify="space-evenly"
          >
            <NButton
              quaternary
              size="tiny"
              focusable={false}
              onClick={() => windowIPC.controlWindow(WindowControlType.ON_TOP, !isOnTop.value)}
            >
              {isOnTop.value ? (
                <SvgIcon size={16} name="ic_fluent_pin_off_24_regular" />
              ) : (
                <SvgIcon size={16} name="ic_fluent_pin_24_regular" />
              )}
            </NButton>
            <NButton
              quaternary
              size="tiny"
              focusable={false}
              onClick={() => windowIPC.controlWindow(WindowControlType.MINIMIZE)}
            >
              <SvgIcon size={16} name="ic_fluent_subtract_24_regular" />
            </NButton>
            <NButton
              quaternary
              size="tiny"
              focusable={false}
              onClick={() =>
                windowIPC.controlWindow(WindowControlType.MAXIMIZE, !isMaximized.value)
              }
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
              onClick={() => windowIPC.controlWindow(WindowControlType.CLOSE)}
            >
              <SvgIcon size={16} name="ic_fluent_dismiss_24_regular" />
            </NButton>
          </NSpace>
        </div>
      </div>
    )
  }
})
