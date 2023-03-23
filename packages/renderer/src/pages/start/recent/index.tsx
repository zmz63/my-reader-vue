import { defineComponent, ref } from 'vue'
import type { BookData, BookMeta } from '@preload/channel/db'
import Search from '@/components/Search'
import BooksShowcase from '@/components/BooksShowcase'
import './index.scss'

export default defineComponent({
  setup() {
    const bookList = ref<BookMeta[]>([])

    const getRecentBookList = async () => {
      const list = await dbChannel.getRecentBookMetaList()

      console.log('list', list)

      bookList.value = list
    }

    getRecentBookList()

    return () => (
      <div class="recent-page">
        <BooksShowcase list={bookList.value} />
      </div>
    )
  }
})
