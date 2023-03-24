import { type PropType, defineComponent } from 'vue'
import { NInput, inputProps } from 'naive-ui'
import type { OnUpdateValue } from 'naive-ui/es/input/src/interface'
import SVGIcon from '@/components/SVGIcon'
import './index.scss'

const searchBoxProps = {
  ...inputProps,
  width: {
    type: [Number, String] as PropType<number | string>,
    default: '100%'
  }
} as const

export default defineComponent({
  props: searchBoxProps,
  emits: {
    search(content: string) {
      return typeof content === 'string'
    }
  },
  setup(props, { emit }) {
    let content = ''

    const handleKeyup = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        emit('search', content)
        event.preventDefault()
      }
    }

    const handleInput = (value: Parameters<OnUpdateValue>[0]) => {
      props.onInput?.(value)
      content = value
    }

    return () => (
      <div
        class="search"
        style={`width: ${typeof props.width === 'number' ? `${props.width}px` : props.width}`}
      >
        <NInput defaultValue={props.defaultValue} onInput={handleInput} onKeyup={handleKeyup}>
          {{
            prefix: () => (
              <SVGIcon class="search-prefix" size={20} name="ic_fluent_search_24_regular" />
            )
          }}
        </NInput>
      </div>
    )
  }
})
