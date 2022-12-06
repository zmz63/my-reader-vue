import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { tabValues } from '@/router'
import './index.scss'

export default defineComponent({
  setup() {
    return () => (
      <div class="side-bar">
        {tabValues.map(({ path, text }) => (
          <RouterLink to={{ name: path }} class="item" activeClass="active" key={path}>
            {text}
          </RouterLink>
        ))}
      </div>
    )
  }
})
