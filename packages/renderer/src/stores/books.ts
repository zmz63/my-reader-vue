import { reactive } from 'vue'
import { defineStore } from 'pinia'

export type Book = {
  data: typeof ePub.Book
}

export const useBookStore = defineStore('book', () => {
  const books = reactive<Book[]>([])

  const importBook = async (path: string) => {
    const book = new ePub.Book(path)
    try {
      await book.opened
      console.log(book)
      // books.push({
      //   data: markRaw(ePub),
      //   coverUrl: URL.createObjectURL(new Blob([ePub.cover as Buffer]))
      // })
    } catch (error) {
      // TODO
      console.log(error)
    }
  }

  return { books, importBook }
})
