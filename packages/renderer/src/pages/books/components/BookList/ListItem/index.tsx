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
        <td class="text">{props.metadata.title}</td>
        <td class="text">{props.metadata.creator}</td>
        <td>
          <div>操作</div>
        </td>
      </tr>
    )
  }
})
