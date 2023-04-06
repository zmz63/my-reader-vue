import { defineComponent } from 'vue'
import './index.scss'

const optionItemProps = {
  label: {
    type: String,
    required: true
  }
} as const

export default defineComponent({
  props: optionItemProps,
  setup(props, { slots }) {
    return () => (
      <div class="reader-page-option-item">
        <div class="option-header">
          <div class="label">{props.label}</div>
          {slots.header && slots.header()}
        </div>
        <div class="option-content">{slots.default && slots.default()}</div>
      </div>
    )
  }
})
