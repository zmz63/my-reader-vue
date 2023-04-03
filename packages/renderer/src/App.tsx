import { defineComponent } from 'vue'
import {
  NConfigProvider,
  NElement,
  NMessageProvider,
  NNotificationProvider,
  NPopover
} from 'naive-ui'
import { defaultTheme } from './themes'
import { useLayoutStore } from './stores/layout'
import Layout from './layout'
import './App.scss'

export default defineComponent({
  setup() {
    const layoutStore = useLayoutStore()

    return () => (
      <NConfigProvider themeOverrides={defaultTheme}>
        <NElement class="app">
          <NPopover
            to={layoutStore.popoverData.to}
            show={layoutStore.popoverData.show}
            x={layoutStore.popoverData.x}
            y={layoutStore.popoverData.y}
            trigger="manual"
            placement="bottom"
          >
            {layoutStore.popoverData.content && layoutStore.popoverData.content()}
          </NPopover>
          <NNotificationProvider max={5}>
            <NMessageProvider>
              <Layout />
            </NMessageProvider>
          </NNotificationProvider>
        </NElement>
      </NConfigProvider>
    )
  }
})
