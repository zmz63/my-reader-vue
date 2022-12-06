import { defineComponent, onBeforeMount, onUnmounted, ref } from 'vue'
import SearchBar from '@/components/SearchBar'
import ThemeIcon from '@/icons/Theme'
import SettingIcon from '@/icons/Setting'
import MinimizeIcon from '@/icons/Minimize'
import MaximizeIcon from '@/icons/Maximize'
import Unmaximize from '@/icons/Unmaximize'
import CloseIcon from '@/icons/Close'
import './index.scss'

const { manageWindow, onWindowMaximize } = window.electron.windowUtil

export default defineComponent({
  setup() {
    const isMaximized = ref(false)

    let handler: () => void

    onBeforeMount(() => {
      handler = onWindowMaximize(value => {
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
          <div class="button-wrapper">
            <div class="icon setting">
              <ThemeIcon />
            </div>
            <div class="icon setting">
              <SettingIcon />
            </div>
          </div>
          <div class="divider"></div>
          <div class="button-wrapper">
            <div class="icon" onClick={() => manageWindow('minimize')}>
              <MinimizeIcon />
            </div>
            <div class="icon" onClick={() => manageWindow('maximize')}>
              {isMaximized.value ? <Unmaximize /> : <MaximizeIcon />}
            </div>
            <div class="icon" onClick={() => manageWindow('close')}>
              <CloseIcon />
            </div>
          </div>
        </div>
      </div>
    )
  }
})
