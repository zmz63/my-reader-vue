import { defineComponent, ref } from 'vue'
import { NButton, NScrollbar } from 'naive-ui'
import { useBookStore } from '@/stores/books'
import SvgIcon from '@/components/SvgIcon'
import BookCards from './components/BookCards'
import BookList from './components/BookList'
import './index.scss'

import epub from '@/epub'

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
        // importBook(path)
        if (!testRef.value) {
          return
        }
        const book = new ePub.Book(path)
        // const rendition = new ePub.Rendition(book, testRef.value)
        try {
          await book.opened
          console.log(book)
        } catch (error) {
          console.log(error)
        }
      }
    }

    const testRef = ref<HTMLDivElement>()

    const testEPub = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '*'
      input.onchange = event => {
        const files = (event.target as HTMLInputElement).files
        if (files) {
          const book = epub(files[0])
          console.log(book)
          const rendition = book.renderTo(testRef.value, {
            width: '100%',
            height: '100%',
            spread: 'always'
            // writingMode: 'vertical-lr'
            // axis: 'horizontal',
            // flow: 'scrolled'
            // defaultDirection: 'rtl',
            // direction: 'rtl'
          })
          console.log(rendition)
          rendition.display(10)
        }
      }
      input.click()
    }

    const displayMode = ref<DisplayMode>('card')

    const handleSwitchDisplayMode = (mode: DisplayMode) => {
      if (mode === displayMode.value) {
        return
      }

      displayMode.value = mode
    }

    // const renderBooks = () => {
    //   switch (displayMode.value) {
    //     case 'card':
    //       return <BookCards books={books} />
    //     case 'list':
    //       return <BookList books={books} />
    //     default:
    //       return <BookCards books={books} />
    //   }
    // }

    return () => (
      <div class="books-page">
        <div class="books-header">
          <div class="left">
            <NButton onClick={handleImportBook}>Import</NButton>
            <NButton onClick={testEPub}>Test</NButton>
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
        <div class="test" ref={testRef}></div>
        {/* <NScrollbar>
          <div class="books-main-container">{renderBooks()}</div>
        </NScrollbar> */}
      </div>
    )
  }
})
