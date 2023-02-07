import { defineComponent, ref } from 'vue'
import { useBookStore } from '@/stores/book'
import './index.scss'

export default defineComponent({
  setup() {
    const { books, importBook } = useBookStore()

    const handleImportBook = async () => {
      const paths = await appIPC.selectOpenFilePaths({
        filters: [{ name: 'Electronic Book', extensions: ['epub'] }],
        properties: ['multiSelections']
      })

      if (!paths) return

      for (const path of paths) {
        importBook(path)
      }
    }

    return () => (
      <div class="book-page">
        <div class="test">
          <div class="button" onClick={handleImportBook}>
            Import
          </div>
        </div>
        <div class="book-container">
          {books.map(item => (
            <>
              <div>{item.data.metadata.title}</div>
              <img src={item.coverUrl} />
            </>
          ))}
        </div>
      </div>
    )
  }
})
