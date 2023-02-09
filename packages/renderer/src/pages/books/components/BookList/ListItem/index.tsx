import { defineComponent } from 'vue'
import { bookItemProps } from '@/pages/books/types'
import './index.scss'

export default defineComponent({
  props: bookItemProps,
  setup(props) {
    return () => (
      <tr class="list-item">
        <td class="cover-wrapper">
          {props.cover ? <img class="cover" src={props.cover} /> : null}
        </td>
      </tr>
    )
  }
})
