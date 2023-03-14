import { defineComponent } from 'vue'
import { NConfigProvider, NElement, NMessageProvider, NNotificationProvider } from 'naive-ui'
import { defaultTheme } from '@/themes'
import Layout from './layout'
import './App.scss'

export default defineComponent({
  setup() {
    return () => (
      <NConfigProvider themeOverrides={defaultTheme}>
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
