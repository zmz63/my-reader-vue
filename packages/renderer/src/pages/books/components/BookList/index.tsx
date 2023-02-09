import { defineComponent } from 'vue'
import { NTbody } from 'naive-ui'
import { useBookStore } from '@/stores/book'
import ListItem from './ListItem'
import './index.scss'

export default defineComponent({
  setup() {
    const { books } = useBookStore()

    return () => (
      <div class="book-list">
        <NTbody>
          {books.map(({ data: { metadata }, coverUrl }) => (
            <ListItem metadata={metadata} cover={coverUrl} />
          ))}
        </NTbody>
      </div>
    )
  }
})
