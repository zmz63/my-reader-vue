import { defineComponent } from 'vue'
import { useBookStore } from '@/stores/book'
import ListItem from './ListItem'
import './index.scss'

export default defineComponent({
  setup() {
    const { books } = useBookStore()

    return () => (
      <table class="book-list">
        <colgroup class="book-list-column">
          <col class="cover" />
          <col class="text" />
          <col class="text" />
          <col class="action" />
        </colgroup>
        <tbody class="book-list-container">
          {books.map(({ data: { metadata }, coverUrl }) => (
            <ListItem metadata={metadata} cover={coverUrl} />
          ))}
        </tbody>
      </table>
    )
  }
})
