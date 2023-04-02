import { type PropType, defineComponent } from 'vue'
import type { BookMeta } from '@preload/channel/db'
import Image from '@/components/Image'
import './index.scss'

const bookCardsProps = {
  list: {
    type: Array as PropType<BookMeta[]>,
    required: true
  }
} as const

export default defineComponent({
  props: bookCardsProps,
  emits: {
    open(id: number | bigint) {
      return typeof id === 'number' || typeof id === 'bigint'
    }
  },
  setup(props, { emit }) {
    return () => (
      <div class="book-cards-wrapper">
        {props.list.map(item => (
          <div class="card-item" key={item.id.toString()}>
            <Image
              class="cover-wrapper"
              imageClass="cover"
              data={item.cover}
              onClick={() => emit('open', item.id)}
            >
              {{
                placeholder: () => (
                  <div class="cover-placeholder">
                    <div class="cover-title">{item.title}</div>
                  </div>
                )
              }}
            </Image>
            <div class="title-wrapper" onClick={() => emit('open', item.id)}>
              <div class="ellipsis title">{item.title}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }
})
