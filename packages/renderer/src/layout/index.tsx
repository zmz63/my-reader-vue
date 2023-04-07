import { defineComponent, onBeforeMount, onUnmounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { NButton } from 'naive-ui'
import { useBookStore } from '@/stores/book'
import SVGIcon from '@/components/SVGIcon'
import './index.scss'

export default defineComponent({
  setup() {
    const bookStore = useBookStore()

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
          <div class="left">
            {bookStore.bookMeta ? (
              <div class="top-bar-slot">
                <div class="ellipsis">{bookStore.bookMeta.title}</div>
                <div class="divider">-</div>
                <div class="ellipsis">{bookStore.bookMeta.creator}</div>
              </div>
            ) : (
              <div class="title">EPub Reader</div>
            )}
          </div>
          <div class="right">
            <div class="divider" />
            <div class="button-wrapper">
              <NButton
                quaternary
                size="tiny"
                focusable={false}
                onClick={() => windowChannel.controlWindow('always-on-top', !isOnTop.value)}
              >
                <SVGIcon
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
                <SVGIcon size={16} name="ic_fluent_subtract_24_regular" />
              </NButton>
              <NButton
                quaternary
                size="tiny"
                focusable={false}
                onClick={() => windowChannel.controlWindow('maximize', !isMaximized.value)}
              >
                <SVGIcon
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
                <SVGIcon size={16} name="ic_fluent_dismiss_24_regular" />
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
