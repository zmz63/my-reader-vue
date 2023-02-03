import { defineComponent } from 'vue'
import './index.scss'

const svgIconProps = {
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number
  }
} as const

export default defineComponent({
  props: svgIconProps,
  setup(props) {
    return () => (
      <svg
        class="svg-icon"
        style={{
          fontSize: props.size ? `${props.size}px` : ''
        }}
      >
        <use xlinkHref={`#icon-${props.name}`} />
      </svg>
    )
  }
})
