import { defineComponent, ref, watch } from 'vue'
import { NButton, NRadio, NRadioGroup } from 'naive-ui'
import { useLayoutStore } from '@/stores/layout'
import { dark, light } from '@/themes'
import './index.scss'

export default defineComponent({
  setup() {
    const layoutStore = useLayoutStore()

    const theme = ref<'light' | 'dark'>(layoutStore.themeData.mode)

    watch(
      () => theme.value,
      (value, oldValue) => {
        if (value !== oldValue) {
          layoutStore.changeTheme(theme.value)
        }
      }
    )

    return () => (
      <div class="setting-page">
        <div class="setting-page-option-group">
          <div class="title">通用</div>
          <div class="setting-page-option-item">
            <div class="label">主题</div>
            <NRadioGroup class="theme-switch-group" v-model:value={theme.value}>
              <div class="theme-switch" onClick={() => (theme.value = 'light')}>
                <div
                  class="preview"
                  style={{
                    'background-color': light.bodyColor,
                    'color': light.textColor2
                  }}
                >
                  Hello World!
                </div>
                <div class="radio-wrapper">
                  <NRadio value="light">浅色</NRadio>
                </div>
              </div>
              <div class="theme-switch" onClick={() => (theme.value = 'dark')}>
                <div
                  class="preview"
                  style={{
                    'background-color': dark.bodyColor,
                    'color': dark.textColor2
                  }}
                >
                  Hello World!
                </div>
                <div class="radio-wrapper">
                  <NRadio value="dark">深色</NRadio>
                </div>
              </div>
            </NRadioGroup>
          </div>
          <div class="setting-page-option-item horizontal">
            <div class="label">控制台</div>
            <NButton type="primary" size="small" onClick={appChannel.toggleDevTools}>
              打开
            </NButton>
          </div>
          {/* <div class="setting-page-option-item horizontal">
            <div class="label">打开程序继续上次阅读</div>
            <NSwitch />
          </div> */}
        </div>
      </div>
    )
  }
})
