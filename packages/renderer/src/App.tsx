import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { NConfigProvider, NElement, NMessageProvider, NNotificationProvider } from 'naive-ui'
import { defaultTheme } from '@/themes'
import './App.scss'

export default defineComponent({
  setup() {
    return () => (
      <NConfigProvider themeOverrides={defaultTheme}>
        <NElement class="app">
          <NNotificationProvider max={5}>
            <NMessageProvider>
              <RouterView />
            </NMessageProvider>
          </NNotificationProvider>
        </NElement>
      </NConfigProvider>
    )
  }
})
