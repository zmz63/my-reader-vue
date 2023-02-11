import { defineComponent, ref } from 'vue'
import { NButton, NScrollbar } from 'naive-ui'
import { useBookStore } from '@/stores/books'
import SvgIcon from '@/components/SvgIcon'
import BookCardWrapper from './components/BookCardWrapper'
import BookList from './components/BookList'
import './index.scss'

type DisplayMode = 'list' | 'card'

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

    const displayMode = ref<DisplayMode>('card')

    const handleSwitchDisplayMode = (mode: DisplayMode) => {
      if (mode === displayMode.value) {
        return
      }

      displayMode.value = mode
    }

    const renderBooks = () => {
      switch (displayMode.value) {
        case 'card':
          return <BookCardWrapper books={books} />
        case 'list':
          return <BookList books={books} />
        default:
          return <BookCardWrapper books={books} />
      }
    }

    return () => (
      <div class="books-page">
        <div class="books-header">
          <div class="left">
            <NButton onClick={handleImportBook}>Import</NButton>
          </div>
          <div class="right">
            <NButton text focusable={false} onClick={() => handleSwitchDisplayMode('card')}>
              <SvgIcon
                size={24}
                name={
                  displayMode.value === 'card'
                    ? 'ic_fluent_textbox_align_bottom_rotate_90_24_filled'
                    : 'ic_fluent_textbox_align_bottom_rotate_90_24_regular'
                }
              />
            </NButton>
            <NButton text focusable={false} onClick={() => handleSwitchDisplayMode('list')}>
              <SvgIcon
                size={24}
                name={
                  displayMode.value === 'list'
                    ? 'ic_fluent_apps_list_24_filled'
                    : 'ic_fluent_apps_list_24_regular'
                }
              />
            </NButton>
          </div>
        </div>
        <NScrollbar>
          <div class="books-main-container">{renderBooks()}</div>
        </NScrollbar>
      </div>
    )
  }
})
