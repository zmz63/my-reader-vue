import { type PropType, defineComponent } from 'vue'
import type { Book } from '@/stores/books'
import type { Metadata } from '@packages/preload/epub/types'
import './index.scss'
import { NScrollbar } from 'naive-ui'

const metaKeys: [keyof Metadata, string, string?][] = [
  ['creator', '作者', '佚名'],
  ['publisher', '出版', '未知'],
  ['description', '描述']
]

const bookCardWrapperProps = {
  books: {
    type: Array as PropType<Book[]>,
    default: []
  }
} as const

export default defineComponent({
  props: bookCardWrapperProps,
  setup(props) {
    return () => (
      <div class="book-card-wrapper">
        {props.books.map(({ data: { metadata }, coverUrl }) => (
          <div class="book-card-item">
            <div class="cover-wrapper">
              {coverUrl ? <img class="cover" src={coverUrl} /> : null}
            </div>
            <NScrollbar>
              <div class="metadata-wrapper">
                <div class="title">{metadata.title}</div>
                {metaKeys.map(([key, label]) =>
                  metadata[key] ? (
                    <div class="text-wrapper">
                      <div class="label">{label}:</div>
                      <div class="value">{metadata[key]}</div>
                    </div>
                  ) : null
                )}
              </div>
            </NScrollbar>
          </div>
        ))}
      </div>
    )
  }
})
