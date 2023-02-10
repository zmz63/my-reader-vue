import { defineComponent, ref } from 'vue'
import { NButton, NScrollbar } from 'naive-ui'
import { useBookStore } from '@/stores/book'
import SvgIcon from '@/components/SvgIcon'
import CardWrapper from './components/CardWrapper'
import BookList from './components/BookList'
import type { DisplayMode } from './types'
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
          return <CardWrapper />
        case 'list':
          return <BookList />
        default:
          return <CardWrapper />
      }
    }

    return () => (
      <div class="books-page">
        <div class="books-header">
          <div class="left">hello</div>
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
        <div class="test">
          <div class="button" onClick={handleImportBook}>
            Import
          </div>
        </div>
        <NScrollbar>
          <div class="books-main-container">{renderBooks()}</div>
        </NScrollbar>
      </div>
    )
  }
})
