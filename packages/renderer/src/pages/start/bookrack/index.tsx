import { defineComponent } from 'vue'
import { NButton } from 'naive-ui'
import { useBookStore } from '@/stores/book'
import Search from '@/components/Search'
import BooksShowcase from '@/components/BooksShowcase'
import './index.scss'

export default defineComponent({
  setup() {
    const bookStore = useBookStore()

    const importBooks = () => {
      bookStore.importBooks()
    }

    return () => (
      <div class="bookrack-page">
        <BooksShowcase list={[]}>
          {{
            header: () => (
              <div class="bookrack-page-header">
                <Search />
                <NButton onClick={importBooks}>导入</NButton>
              </div>
            )
          }}
        </BooksShowcase>
      </div>
    )
  }
})
