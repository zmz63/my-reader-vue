import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { defaultTheme } from '@/themes'

export default defineComponent({
  setup() {
    return () => (
      <NConfigProvider themeOverrides={defaultTheme}>
        <NMessageProvider>
          <RouterView />
        </NMessageProvider>
      </NConfigProvider>
    )
  }
})
