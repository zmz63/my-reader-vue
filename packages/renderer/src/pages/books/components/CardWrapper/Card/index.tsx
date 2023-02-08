import { defineComponent } from 'vue'
import { NScrollbar } from 'naive-ui'
import './index.scss'

const bookCardProps = {
  title: {
    type: String
  },
  cover: {
    type: String
  },
  creator: {
    type: String
  },
  description: {
    type: String
  },
  publisher: {
    type: String
  }
} as const

export default defineComponent({
  props: bookCardProps,
  setup(props) {
    const metaKeys = [
      ['creator', '作者'],
      ['description', '描述'],
      ['publisher', '出版社']
    ]

    return () => (
      <div class="book-card">
        <div class="cover-wrapper">
          <img class="cover" src={props.cover} />
        </div>
        <div class="metadata-wrapper">
          <NScrollbar class="scrollbar">
            <div class="metadata">
              <div class="title">{props.title}</div>
              {metaKeys.map(([key, label]) => (
                <div class="text-wrapper">
                  <div class="label">{label}</div>
                  <div class="value">{props[key as unknown as keyof props]}</div>
                </div>
              ))}
            </div>
          </NScrollbar>
        </div>
      </div>
    )
  }
})
