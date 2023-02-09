import { defineComponent } from 'vue'
import { NScrollbar } from 'naive-ui'
import { useBookStore } from '@/stores/book'
import CardWrapper from './components/CardWrapper'
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
        <div class="test">
          <div class="button" onClick={handleImportBook}>
            Import
          </div>
        </div>
        <NScrollbar style={{ height: '100%' }}>
          <div class="main-container">
            <CardWrapper />
          </div>
        </NScrollbar>
      </div>
    )
  }
})