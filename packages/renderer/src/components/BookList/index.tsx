import { type PropType, defineComponent } from 'vue'
import type { BookMeta } from '@preload/channel/db'
import Image from '@/components/Image'
import './index.scss'

const bookListProps = {
  list: {
    type: Array as PropType<BookMeta[]>,
    required: true
  }
} as const

export default defineComponent({
  props: bookListProps,
  emits: {
    open(id: number | bigint) {
      return typeof id === 'number' || typeof id === 'bigint'
    }
  },
  setup(props, { emit }) {
    return () => (
      <div class="book-list">
        {props.list.map(item => (
          <div class="list-item" key={item.rowid.toString()}>
            <Image
              class="cover-wrapper"
              imageClass="cover"
              data={item.cover}
              onClick={() => emit('open', item.rowid)}
            >
              {{
                placeholder: () => (
                  <div class="cover-placeholder">
                    <div class="cover-title">{item.title}</div>
                  </div>
                )
              }}
            </Image>
            <div class="meta-wrapper">
              <div class="top">
                <div class="text title" onClick={() => emit('open', item.rowid)}>
                  {item.title}
                </div>
                <div class="text creator">{item.creator ? item.creator : '佚名'}</div>
                <div class="text publisher">{item.publisher ? item.publisher : '未知出版社'}</div>
                <div class="description">{item.description ? item.description : '暂无简介'}</div>
              </div>
              <div class="bottom">
                <div>hello</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
})
