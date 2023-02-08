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
          <Card
            title={metadata.title}
            cover={coverUrl}
            creator={metadata.creator}
            description={metadata.description}
            publisher={metadata.publisher}
          />
        ))}
      </div>
    )
  }
})
