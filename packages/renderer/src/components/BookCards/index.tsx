import { type PropType, defineComponent } from 'vue'
import { NButton, NDropdown, NPopover } from 'naive-ui'
import type { BookMeta } from '@preload/channel/db'
import Image from '@/components/Image'
import TextHover from '@/components/TextHover'
import SVGIcon from '@/components/SVGIcon'
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
            <NPopover to={false} showArrow={false} flip={false} raw>
              {{
                trigger: () => (
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
                ),
                default: () => (
                  <div
                    class="hover-wrapper"
                    onClick={event => {
                      if (event.target === event.currentTarget) {
                        emit('open', item.id)
                      }
                    }}
                  >
                    {item.percentage ? (
                      <TextHover
                        text="进度"
                        placement="right"
                        content={() => (
                          <div class="progress">
                            {`${Math.round((item.percentage as number) * 100)}%`}
                          </div>
                        )}
                      />
                    ) : (
                      <div />
                    )}
                    <NDropdown
                      to={false}
                      placement="bottom-end"
                      options={[
                        {
                          label: '删除',
                          key: 'delete',
                          icon: () => <SVGIcon size={24} name="ic_fluent_delete_24_filled" />
                        }
                      ]}
                      onSelect={() => {
                        // TODO
                      }}
                    >
                      <NButton text focusable={false}>
                        <SVGIcon size={24} name="ic_fluent_more_vertical_24_filled" />
                      </NButton>
                    </NDropdown>
                  </div>
                )
              }}
            </NPopover>
            <div class="title-wrapper" onClick={() => emit('open', item.id)}>
              <div class="ellipsis title">{item.title}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }
})
