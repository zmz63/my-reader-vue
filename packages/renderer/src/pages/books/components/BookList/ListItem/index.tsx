import { defineComponent } from 'vue'
import { bookItemProps } from '@/pages/books/types'
import './index.scss'

export default defineComponent({
  props: bookItemProps,
  setup(props) {
    return () => (
      <tr class="list-item">
        <td>
          <div class="cover-wrapper">
            {props.cover ? <img class="cover" src={props.cover} /> : null}
          </div>
        </td>
        <td>
          <div class="title">{props.metadata.title}</div>
        </td>
        <td>
          <div class="text">{props.metadata.creator}</div>
        </td>
        <td>
          <div class="text">{props.metadata.publisher}</div>
        </td>
        <td>
          <div>操作</div>
        </td>
      </tr>
    )
  }
})
