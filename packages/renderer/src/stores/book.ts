import { ref } from 'vue'
import { defineStore } from 'pinia'

type BaseBookMeta = {
  title: string
  creator: string
}

export const useBookStore = defineStore('book', () => {
  const bookMeta = ref<BaseBookMeta | null>(null)

  const setBookMeta = (title: string, creator: string) => {
    bookMeta.value = {
      title,
      creator
    }
  }

  const clearBookMeta = () => {
    bookMeta.value = null
  }

  return { bookMeta, setBookMeta, clearBookMeta }
})
