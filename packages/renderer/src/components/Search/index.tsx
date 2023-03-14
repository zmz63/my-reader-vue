import { defineComponent } from 'vue'
import { NInput, inputProps } from 'naive-ui'
import type { OnUpdateValue } from 'naive-ui/es/input/src/interface'
import SvgIcon from '@/components/SvgIcon'
import './index.scss'

const searchBoxProps = {
  ...inputProps
} as const

export default defineComponent({
  props: searchBoxProps,
  emits: {
    search(payload: string) {
      return typeof payload === 'string'
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
      <div class="search">
        <NInput defaultValue={props.defaultValue} onInput={handleInput} onKeyup={handleKeyup}>
          {{
            prefix: () => (
              <SvgIcon class="search-prefix" size={20} name="ic_fluent_search_24_regular" />
            )
          }}
        </NInput>
      </div>
    )
  }
})
