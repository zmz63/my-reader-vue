import { type Raw, markRaw, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BookData } from '@main/db/server'
import type { Book } from '@preload/epub'
import router from '@/router'

interface OpenBook {
  (path: string): Promise<void>
  (): Promise<void>
}

interface ImportBooks {
  (paths: string[]): Promise<void>
  (): Promise<void>
}

export const useBookStore = defineStore('book', () => {
  const books = reactive<Book[]>([])

  const currentBook = ref<Raw<Book> | null>(null)

  const openBook = (async (path?: string) => {
    let bookPath = path

    if (!bookPath) {
      const paths = await appChannel.selectOpenFilePaths({
        filters: [{ name: 'Electronic Book', extensions: ['epub'] }]
      })

      if (!paths) {
        return
      }

      bookPath = paths[0]
    }

    const book = new ePub.Book(bookPath, { unpack: true })

    await book.opened

    await book.unpacked

    currentBook.value = markRaw(book)

    router.push({ name: 'READER' })
  }) as OpenBook

  const importBooks = (async (paths?: string[]) => {
    let bookPaths = paths

    if (!bookPaths) {
      const paths = await appChannel.selectOpenFilePaths({
        filters: [{ name: 'Electronic Book', extensions: ['epub'] }],
        properties: ['multiSelections']
      })

      if (!paths) {
        return
      }

      bookPaths = paths
    }

    const promises: Promise<unknown>[] = []
    for (const path of bookPaths) {
      const book = new ePub.Book(path)

      promises.push(
        book.opened
          .then(async () => {
            const { title, creator, description, identifier } = book.package.metadata

            const bookData: BookData = {
              md5: book.md5,
              size: (book.file as Buffer).byteLength,
              createTime: Math.floor(Date.now() / 1000),
              file: book.file,
              title,
              cover: book.package.cover,
              creator,
              description,
              identifier
            }

            await dbChannel.addBook(bookData)

            return bookData
          })
          .catch(error => error)
      )
    }

    await Promise.all(promises)

    // TODO
  }) as ImportBooks

  const getRecentBooks = () => {
    // TODO
  }

  const getBooks = () => {
    // TODO
  }

  return {
    currentBook,
    books,
    openBook,
    importBooks,
    getRecentBooks,
    getBooks
  }
})
