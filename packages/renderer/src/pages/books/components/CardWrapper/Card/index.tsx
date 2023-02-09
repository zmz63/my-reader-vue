import { type PropType, defineComponent } from 'vue'
import { NScrollbar } from 'naive-ui'
import type { Metadata } from '@preload/utils/epub/types'
import './index.scss'

const bookCardProps = {
  metadata: {
    type: Object as PropType<Partial<Metadata>>,
    required: true
  },
  cover: {
    type: String
  }
} as const

export default defineComponent({
  props: bookCardProps,
  setup(props) {
    const metaKeys: [keyof Metadata, string, string?][] = [
      ['creator', '作者', '佚名'],
      ['publisher', '出版', '未知'],
      ['description', '描述']
    ]

    return () => (
      <div class="book-card">
        <div class="cover-wrapper">
          {props.cover ? <img class="cover" src={props.cover} /> : null}
        </div>
        <NScrollbar style={{ height: '100%' }}>
          <div class="metadata-wrapper">
            <div class="title">{props.metadata.title}</div>
            {metaKeys.map(([key, label]) =>
              props.metadata[key] ? (
                <div class="text-wrapper">
                  <div class="label">{label}:</div>
                  <div class="value">{props.metadata[key]}</div>
                </div>
              ) : null
            )}
          </div>
        </NScrollbar>
      </div>
    )
  }
})
