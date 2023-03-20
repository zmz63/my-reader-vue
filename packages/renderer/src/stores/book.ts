import { type Raw, markRaw, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BookData } from '@main/db/server'

interface OpenBook {
  (path: string): Promise<void>
  (): Promise<void>
}

interface ImportBooks {
  (paths: string[]): Promise<void>
  (): Promise<void>
}

export const useBookStore = defineStore('book', () => {
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

    // router.push({ name: 'READER' })
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

            const id = await dbChannel.insertBook(bookData)
            console.log('id', id)

            return bookData
          })
          .catch(error => error)
      )
    }

    await Promise.all(promises)

    // TODO
  }) as ImportBooks

  const getBookMetaList = () => {
    // TODO
  }

  return {
    openBook,
    importBooks,
    getBookMetaList
  }
})
