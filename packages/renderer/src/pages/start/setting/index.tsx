import { defineComponent } from 'vue'
import './index.scss'

export default defineComponent({
  setup() {
    return () => (
      <div class="setting-page">
        <div class="setting-page-option-group">
          <div class="title">外观</div>
          <div class="setting-page-option-item">
            <div class="label">背景</div>
            <div>hello</div>
          </div>
          <div class="setting-page-option-item">
            <div class="label">主色</div>
            <div>hello</div>
          </div>
        </div>
      </div>
    )
  }
})
