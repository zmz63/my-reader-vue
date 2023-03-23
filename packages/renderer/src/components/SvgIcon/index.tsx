import { defineComponent } from 'vue'
import './index.scss'

const SVGIconProps = {
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number
  }
} as const

export default defineComponent({
  props: SVGIconProps,
  setup(props) {
    return () => (
      <svg
        class="svg-icon"
        style={{
          fontSize: props.size ? `${props.size}px` : 'inherit'
        }}
      >
        <use xlinkHref={`#icon-${props.name}`} />
      </svg>
    )
  }
})
