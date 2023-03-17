import { defineComponent, onBeforeMount, onUnmounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { NButton } from 'naive-ui'
import SvgIcon from '@/components/SvgIcon'
import './index.scss'

export default defineComponent({
  setup() {
    const isOnTop = ref(false)
    const isMaximized = ref(false)

    let alwaysOnTopChangedHandler: () => void
    let maximizeHandler: () => void

    onBeforeMount(() => {
      alwaysOnTopChangedHandler = windowChannel.addWindowStateListener(
        'always-on-top-changed',
        value => {
          isOnTop.value = value
        }
      )
      maximizeHandler = windowChannel.addWindowStateListener('maximize', value => {
        isMaximized.value = value
      })
    })

    onUnmounted(() => {
      alwaysOnTopChangedHandler()
      maximizeHandler()
    })

    return () => (
      <div class="layout">
        <div class="layout-top-bar">
          <div class="left">Hello World</div>
          <div class="right">
            <div class="divider" />
            <div class="button-wrapper">
              <NButton
                quaternary
                size="tiny"
                focusable={false}
                onClick={() => windowChannel.controlWindow('always-on-top', !isOnTop.value)}
              >
                <SvgIcon
                  size={16}
                  name={isOnTop.value ? 'ic_fluent_pin_off_24_regular' : 'ic_fluent_pin_24_regular'}
                />
              </NButton>
              <NButton
                quaternary
                size="tiny"
                focusable={false}
                onClick={() => windowChannel.controlWindow('minimize')}
              >
                <SvgIcon size={16} name="ic_fluent_subtract_24_regular" />
              </NButton>
              <NButton
                quaternary
                size="tiny"
                focusable={false}
                onClick={() => windowChannel.controlWindow('maximize', !isMaximized.value)}
              >
                <SvgIcon
                  size={16}
                  name={
                    isMaximized.value
                      ? 'ic_fluent_square_multiple_24_regular'
                      : 'ic_fluent_maximize_24_regular'
                  }
                />
              </NButton>
              <NButton
                quaternary
                size="tiny"
                focusable={false}
                onClick={() => windowChannel.controlWindow('close')}
              >
                <SvgIcon size={16} name="ic_fluent_dismiss_24_regular" />
              </NButton>
            </div>
          </div>
        </div>
        <div class="layout-view">
          <RouterView />
        </div>
      </div>
    )
  }
})
