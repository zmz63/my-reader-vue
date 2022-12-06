import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import './App.scss'

export default defineComponent({
  setup() {
    return () => (
      <div>
        <RouterView />
      </div>
    )
  }
})
