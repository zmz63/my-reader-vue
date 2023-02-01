import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import menu from '@/router/menu'
import './index.scss'

export default defineComponent({
  setup() {
    return () => (
      <div class="side-bar">
        {menu.map(({ name, meta }) => (
          <RouterLink to={{ name }} class="item" activeClass="active" key={name}>
            {meta.label}
          </RouterLink>
        ))}
      </div>
    )
  }
})
