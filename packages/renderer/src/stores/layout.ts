import { type Raw, markRaw, reactive, ref } from 'vue'
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  const topBarSlot = ref<(() => JSX.Element) | null>(null)

  return { topBarSlot }
})
