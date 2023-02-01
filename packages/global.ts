import type { WindowUtil } from '@preload/utils/window'
import type { BookUtil } from '@preload/utils/book'

declare global {
  interface Window {
    electron: {
      windowUtil: WindowUtil
      bookUtil: BookUtil
    }
  }
}
