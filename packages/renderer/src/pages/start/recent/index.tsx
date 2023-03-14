import { defineComponent } from 'vue'
import Search from '@/components/Search'
import BooksShowcase from '@/components/BooksShowcase'
import './index.scss'

export default defineComponent({
  setup() {
    return () => (
      <div class="recent-page">
        <BooksShowcase list={[]}>
          {{
            header: () => <Search />
          }}
        </BooksShowcase>
      </div>
    )
  }
})
