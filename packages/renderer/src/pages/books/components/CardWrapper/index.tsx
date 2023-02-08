import { defineComponent } from 'vue'
import { useBookStore } from '@/stores/book'
import Card from './Card'
import './index.scss'

export default defineComponent({
  setup() {
    const { books } = useBookStore()

    return () => (
      <div class="card-wrapper">
        {books.map(({ data: { metadata }, coverUrl }) => (
          <Card metadata={metadata} cover={coverUrl} />
        ))}
      </div>
    )
  }
})
