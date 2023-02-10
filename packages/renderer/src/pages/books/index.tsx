import { defineComponent } from 'vue'
import { NScrollbar } from 'naive-ui'
import { useBookStore } from '@/stores/book'
import CardWrapper from './components/CardWrapper'
import BookList from './components/BookList'
import './index.scss'

export default defineComponent({
  setup() {
    const { importBook } = useBookStore()

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
      <div class="books-page">
        <div class="books-header">hello</div>
        <div class="test">
          <div class="button" onClick={handleImportBook}>
            Import
          </div>
        </div>
        <NScrollbar>
          <div class="books-main-container">
            <CardWrapper />
            {/* <BookList /> */}
          </div>
        </NScrollbar>
      </div>
    )
  }
})
