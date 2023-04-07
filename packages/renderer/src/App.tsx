import { defineComponent } from 'vue'
import { NConfigProvider, NElement, NMessageProvider, NNotificationProvider } from 'naive-ui'
import { useLayoutStore } from './stores/layout'
import Layout from './layout'
import './App.scss'

export default defineComponent({
  setup() {
    const layoutStore = useLayoutStore()

    return () => (
      <NConfigProvider themeOverrides={layoutStore.theme}>
        <NElement class="app">
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
