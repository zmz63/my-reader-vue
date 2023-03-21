import { defineComponent } from 'vue'
import Search from '@/components/Search'
import BooksShowcase from '@/components/BooksShowcase'
import './index.scss'

export default defineComponent({
  setup() {
    const getRecentBookList = async () => {
      const list = await dbChannel.getRecentBookMetaList()

      console.log('list', list)
    }

    getRecentBookList()

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
