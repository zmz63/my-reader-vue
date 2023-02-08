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
    const metaKeys: [keyof Metadata, string][] = [
      ['creator', '作者'],
      ['description', '描述'],
      ['publisher', '出版社']
    ]

    return () => (
      <div class="book-card">
        <div class="cover-wrapper">
          {props.cover ? <img class="cover" src={props.cover} /> : null}
        </div>
        <div class="metadata-wrapper">
          <NScrollbar class="scrollbar">
            <div class="metadata">
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
      </div>
    )
  }
})
