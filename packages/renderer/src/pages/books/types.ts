import type { PropType } from 'vue'
import type { Metadata } from '@preload/utils/epub/types'

export const bookItemProps = {
  metadata: {
    type: Object as PropType<Partial<Metadata>>,
    required: true
  },
  cover: {
    type: String
  }
} as const

export type DisplayMode = 'list' | 'card'
