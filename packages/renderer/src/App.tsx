import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, NNotificationProvider } from 'naive-ui'
import { defaultTheme } from '@/themes'

export default defineComponent({
  setup() {
    return () => (
      <NConfigProvider themeOverrides={defaultTheme}>
        <NNotificationProvider max={5}>
          <NMessageProvider>
            <RouterView />
          </NMessageProvider>
        </NNotificationProvider>
      </NConfigProvider>
    )
  }
})
