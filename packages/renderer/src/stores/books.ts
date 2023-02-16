import { reactive } from 'vue'
import { defineStore } from 'pinia'

export type Book = {
  data: EPub
}

export const useBookStore = defineStore('book', () => {
  const books = reactive<Book[]>([])

  const importBook = async (path: string) => {
    const ePub = new EPub(path)

    try {
      await ePub.opened.promise

      console.log(ePub)

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
