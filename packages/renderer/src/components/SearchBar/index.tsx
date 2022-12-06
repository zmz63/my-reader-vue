import { defineComponent, ref } from 'vue'
import SearchIcon from '@/icons/Search'
import './index.scss'

export default defineComponent({
  setup() {
    const focused = ref(false)

    const handleBlur = () => {
      focused.value = false
    }

    const handleFocus = () => {
      focused.value = true
    }

    const handleInput = (event: Event) => {
      const { value } = event.target as HTMLInputElement
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.code === 'Enter' || event.keyCode === 13) {
        console.log('123')
      }
    }

    return () => (
      <div class="search-bar">
        <div class="search-box">
          <div class="icon">
            <SearchIcon />
          </div>
          <input
            class="input"
            placeholder="请输入书本名或作者"
            type="text"
            onBlur={handleBlur}
            onFocus={handleFocus}
            onInput={handleInput}
            onKeydown={handleKeydown}
          />
        </div>
        {focused.value && <div class="search-mask"></div>}
        <div v-show={focused.value} class="search-popup"></div>
      </div>
    )
  }
})
