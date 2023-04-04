import { type PropType, defineComponent, ref, watchEffect } from 'vue'
import { NDrawer } from 'naive-ui'
import type { PaginationRenderer } from '@preload/epub'
import OptionItem from './OptionItem'
import './index.scss'

export type SettingPanelInst = {
  show: () => void
}

const settingPanelProps = {
  renderer: {
    type: [Object, null] as PropType<PaginationRenderer | null>,
    required: true
  },
  to: {
    type: [Object, String] as PropType<HTMLElement | string>,
    required: true
  }
} as const

export default defineComponent({
  props: settingPanelProps,
  setup(props, { expose }) {
    const show = ref(false)

    const commonStyles: Record<string, string> = {
      // 'margin-bottom': '3em !important'
    }

    const updateStyles = () => {
      if (props.renderer) {
        props.renderer.setStylesheetRule('div, p, ul, ol, article, pre', {
          ...commonStyles
        })
      }
    }

    const modifyStyles = (key: string, value: string) => {
      commonStyles[key] = value
      updateStyles()
    }

    const deleteStyle = (key: string) => {
      delete commonStyles[key]
      updateStyles()
    }

    const clearStyles = () => {
      for (const key in commonStyles) {
        delete commonStyles[key]
      }
      updateStyles()
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
      <NDrawer
        class="reader-page-setting-panel"
        v-model:show={show.value}
        to={props.to}
        autoFocus={false}
      >
        <div>
          <div>样式</div>
          <OptionItem
            label="段落间距"
            defaultData={{
              value: 16,
              disabled: false,
              unit: 'px'
            }}
            unit={[
              { name: 'px', default: 16, max: 64, min: 0 },
              { name: 'em', default: 1.5, max: 6, min: 0, precision: 2 }
            ]}
            // onChange={() => }
          />
        </div>
      </NDrawer>
    )
  }
})
