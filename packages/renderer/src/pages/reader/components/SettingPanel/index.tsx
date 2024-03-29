import { type PropType, defineComponent, reactive, ref, watch, watchEffect } from 'vue'
import { NInputNumber, NRadio, NRadioGroup, NScrollbar } from 'naive-ui'
import type { PaginationRenderer } from '@preload/epub'
import { dark, light } from '@/themes'
import { useLayoutStore } from '@/stores/layout'
import OptionItem from './OptionItem'
import SliderOptionItem, { type SliderOptionItemData } from './SliderOptionItem'
import './index.scss'

export type SettingPanelInst = {
  show: () => void
}

const settingPanelProps = {
  renderer: {
    type: [Object, null] as PropType<PaginationRenderer | null>,
    required: true
  }
} as const

export default defineComponent({
  props: settingPanelProps,
  setup(props, { expose }) {
    const show = ref(false)

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

    const setScale = (value: number) => {
      if (props.renderer) {
        props.renderer.setScale(value / 100)
      }
    }

    const spreadData = reactive({
      state: 0 as 0 | 1 | 2,
      minWidth: 800
    })

    const setSpread = () => {
      if (props.renderer) {
        if (spreadData.state < 2) {
          props.renderer.setSpread(true, spreadData.state === 1 ? 0 : spreadData.minWidth)
        } else {
          props.renderer.setSpread(false)
        }
      }
    }

    const commonStyles: Record<string, string> = {}

    const updateStyles = () => {
      if (props.renderer) {
        const ruleId = 'epub-reader-setting-panel'

        props.renderer.setStylesheetRule(`*, #${ruleId}`, {
          ...commonStyles
        })
      }
    }

    const modifyStyle = (key: string, value: string) => {
      commonStyles[key] = value
      updateStyles()
    }

    const deleteStyle = (key: string) => {
      delete commonStyles[key]
      updateStyles()
    }

    const handleStyleOptionChange = (key: string, data: SliderOptionItemData) => {
      if (data.disabled) {
        deleteStyle(key)
      } else {
        modifyStyle(key, `${data.value}${data.unit} !important`)
      }
    }

    watchEffect(() => {
      if (props.renderer) {
        updateStyles()
      }
    })

    expose({
      show: () => (show.value = true)
    })

    return () => (
      <>
        <div
          class="reader-page-setting-panel-mask"
          style={{
            'opacity': show.value ? '0.2' : '0',
            'pointer-events': show.value ? undefined : 'none'
          }}
          onClick={() => (show.value = false)}
        />
        <NScrollbar
          class="reader-page-setting-panel"
          style={{ right: show.value ? '0' : '-284px' }}
        >
          <div class="reader-page-option-group">
            <div class="title">基本设置</div>
            <OptionItem label="主题">
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
            </OptionItem>
            <SliderOptionItem
              label="整体缩放"
              switch={false}
              defaultData={{
                value: 100,
                unit: '%'
              }}
              unit={{ name: '%', default: 100, max: 200, min: 70, step: 10 }}
              onChange={({ value }) => setScale(value)}
            />
          </div>
          <div class="reader-page-option-group">
            <div class="title">分页设置</div>
            <OptionItem label="展示列数">
              <NRadioGroup
                value={spreadData.state}
                onUpdateValue={value => {
                  spreadData.state = value
                  setSpread()
                }}
              >
                <NRadio value={0}>自动</NRadio>
                <NRadio value={1}>双列</NRadio>
                <NRadio value={2}>单列</NRadio>
              </NRadioGroup>
            </OptionItem>
            <OptionItem label="最小分列宽度">
              <NInputNumber
                value={spreadData.minWidth}
                placeholder=""
                min={0}
                size="small"
                disabled={spreadData.state > 0}
                precision={0}
                onUpdateValue={value => {
                  if (value === null) {
                    value = 0
                  }
                  spreadData.minWidth = value
                  setSpread()
                }}
              />
            </OptionItem>
          </div>
          <div class="reader-page-option-group">
            <div class="title">样式覆盖</div>
            <SliderOptionItem
              label="段落间距"
              defaultData={{
                value: 20,
                disabled: true,
                unit: 'px'
              }}
              unit={[
                { name: 'px', default: 20, max: 64, min: 0 },
                { name: 'em', default: 2, max: 6, min: 0, precision: 2, step: 0.01 }
              ]}
              onChange={data => handleStyleOptionChange('margin-bottom', data)}
            />
            <SliderOptionItem
              label="行高"
              defaultData={{
                value: 1.5,
                disabled: true,
                unit: 'em'
              }}
              unit={{ name: 'em', default: 1.5, max: 4, min: 1, precision: 2, step: 0.01 }}
              onChange={data => handleStyleOptionChange('line-height', data)}
            />
            <SliderOptionItem
              label="字间距"
              defaultData={{
                value: 0,
                disabled: true,
                unit: 'em'
              }}
              unit={{ name: 'em', default: 0, max: 2, min: 0, precision: 2, step: 0.01 }}
              onChange={data => handleStyleOptionChange('letter-spacing', data)}
            />
          </div>
        </NScrollbar>
      </>
    )
  }
})
