import { type PropType, defineComponent } from 'vue'
import { NPopover } from 'naive-ui'
import './index.scss'

const textHoverProps = {
  text: {
    type: String,
    required: true
  },
  placement: {
    type: String as PropType<
      | 'top-start'
      | 'top'
      | 'top-end'
      | 'right-start'
      | 'right'
      | 'right-end'
      | 'bottom-start'
      | 'bottom'
      | 'bottom-end'
      | 'left-start'
      | 'left'
      | 'left-end'
    >,
    default: 'bottom'
  },
  content: {
    type: Function as PropType<() => JSX.Element>,
    required: true
  }
} as const

export default defineComponent({
  props: textHoverProps,
  setup(props) {
    return () => (
      <NPopover to=".app" showArrow={false} raw placement={props.placement}>
        {{
          trigger: props.content,
          default: () => <div class="text-hover">{props.text}</div>
        }}
      </NPopover>
    )
  }
})
