import { type PropType, defineComponent } from 'vue'
import type { Book } from '@/stores/books'
import './index.scss'

const bookListProps = {
  books: {
    type: Array as PropType<Book[]>,
    default: []
  }
} as const

export default defineComponent({
  props: bookListProps,
  setup(props) {
    return () => (
      <table class="book-list">
        <colgroup class="book-list-column">
          <col class="cover" />
          <col class="title" />
          <col class="text" />
          <col class="text" />
          <col class="action" />
        </colgroup>
        <tbody class="book-list-container">
          {props.books.map(({ data: { metadata }, coverUrl }) => (
            <tr class="book-list-item">
              <td>
                <div class="cover-wrapper">
                  {coverUrl ? <img class="cover" src={coverUrl} /> : null}
                </div>
              </td>
              <td>
                <div class="title">{metadata.title}</div>
              </td>
              <td>
                <div class="text">{metadata.creator}</div>
              </td>
              <td>
                <div class="text">{metadata.publisher}</div>
              </td>
              <td>
                <div>操作</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
})
