import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  const topBarSlot = ref<(() => JSX.Element) | null>(null)

  const popoverData = reactive({
    show: false,
    to: 'body' as string | HTMLElement,
    x: 0,
    y: 0,
    content: null as (() => JSX.Element) | null
  })

  return { topBarSlot, popoverData }
})
