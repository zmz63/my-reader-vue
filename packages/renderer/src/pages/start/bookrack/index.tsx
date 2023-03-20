import { defineComponent, ref } from 'vue'
import { NButton } from 'naive-ui'
import type { BookData, BookMeta } from '@main/db/server'
import Search from '@/components/Search'
import BooksShowcase from '@/components/BooksShowcase'
import './index.scss'

export default defineComponent({
  setup() {
    const bookList = ref<BookMeta[]>([])

    const updateBookList = async () => {
      const list = await dbChannel.getBookMetaList()

      console.log('list', list)

      bookList.value = list
    }

    const importBooks = async () => {
      const paths = await appChannel.selectOpenFilePaths({
        filters: [{ name: 'Electronic Book', extensions: ['epub'] }],
        properties: ['multiSelections']
      })

      if (!paths) {
        return
      }

      const promises: Promise<unknown>[] = []
      for (const path of paths) {
        const book = new ePub.Book(path)

        promises.push(
          book.opened
            .then(async () => {
              const { title, creator, description, date, publisher, identifier } =
                book.package.metadata

              const bookData: BookData = {
                md5: book.md5,
                size: (book.file as Buffer).byteLength,
                createTime: Math.floor(Date.now() / 1000),
                file: book.file,
                title,
                cover: book.package.cover,
                creator,
                description,
                date,
                publisher,
                identifier
              }

              const id = await dbChannel.insertBook(bookData)
              console.log('id', id)
            })
            .catch(error => {
              console.log(error)
            })
        )
      }

      await Promise.all(promises)

      // TODO
    }

    updateBookList()

    return () => (
      <div class="bookrack-page">
        <BooksShowcase list={bookList.value}>
          {{
            header: () => (
              <div class="bookrack-page-header">
                <Search />
                <NButton onClick={importBooks}>导入</NButton>
              </div>
            )
          }}
        </BooksShowcase>
      </div>
    )
  }
})
