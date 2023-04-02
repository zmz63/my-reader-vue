import { defineComponent, ref } from 'vue'
import { NButton } from 'naive-ui'
import type { BookData, BookMeta } from '@preload/channel/db'
import Search from '@/components/Search'
import BooksShowcase from '@/components/BooksShowcase'
import './index.scss'

export default defineComponent({
  setup() {
    const bookList = ref<BookMeta[]>([])

    const updateBookList = async () => {
      const result = await dbChannel.getBookMetaList()

      console.log('list', result)

      bookList.value = result
    }

    updateBookList()

    const importBooks = async () => {
      const paths = await appChannel.selectOpenFilePaths({
        filters: [{ name: 'Electronic Book', extensions: ['epub'] }],
        properties: ['multiSelections']
      })

      if (!paths) {
        return
      }

      const openBook = async (path: string) => {
        try {
          const file = await preloadUtil.openFile(path)
          const book = new ePub.Book(file, false)

          await book.opened

          const { title, creator, description, date, publisher, identifier } = book.package.metadata

          const bookData: BookData = {
            md5: preloadUtil.md5(file),
            size: file.byteLength,
            createTime: Math.floor(Date.now() / 1000),
            file,
            title,
            cover: book.package.cover,
            creator,
            description,
            date,
            publisher,
            identifier
          }

          const result = await dbChannel.insertBook(bookData)

          return result
        } catch (error) {
          return error
        }
      }

      const promises: Promise<unknown>[] = []
      for (const path of paths) {
        promises.push(openBook(path))
      }

      const result = await Promise.all(promises)

      console.log(result)

      updateBookList()

      // TODO
    }

    return () => (
      <div class="bookrack-page">
        <BooksShowcase list={bookList.value}>
          {{
            header: () => (
              <div class="bookrack-page-header">
                <Search width={368} />
                <NButton onClick={importBooks}>导入</NButton>
              </div>
            )
          }}
        </BooksShowcase>
      </div>
    )
  }
})
