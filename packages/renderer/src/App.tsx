import { defineComponent } from 'vue'
import { NConfigProvider, NElement } from 'naive-ui'
import { useLayoutStore } from './stores/layout'
import Layout from './layout'
import './App.scss'

export default defineComponent({
  setup() {
    const layoutStore = useLayoutStore()

    return () => (
      <NConfigProvider themeOverrides={layoutStore.theme}>
        <NElement class="app">
          <Layout />
        </NElement>
      </NConfigProvider>
    )
  }
})
