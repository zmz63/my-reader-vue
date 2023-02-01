import { defineComponent } from 'vue'
import './index.scss'

const svgIconProps = {
  name: {
    type: String,
    required: true
  }
} as const

export default defineComponent({
  props: svgIconProps,
  setup(props) {
    return () => (
      <svg class="svg-icon">
        <use xlinkHref={`#icon-${props.name}`} />
      </svg>
    )
  }
})
