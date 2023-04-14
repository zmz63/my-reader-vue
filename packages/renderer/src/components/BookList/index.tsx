import { type PropType, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NDropdown, NProgress } from 'naive-ui'
import type { BookMeta } from '@preload/channel/db'
import Image from '@/components/Image'
import TextHover from '@/components/TextHover'
import SVGIcon from '@/components/SVGIcon'
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
    },
    delete(id: number | bigint) {
      return typeof id === 'number' || typeof id === 'bigint'
    }
  },
  setup(props, { emit }) {
    const router = useRouter()

    const route = useRoute()

    const handleSearch = (keyword: string) => {
      if (route.name === 'START_SEARCH') {
        router.replace({
          name: 'START_SEARCH',
          query: { keyword }
        })
      } else {
        router.push({
          name: 'START_SEARCH',
          query: { keyword }
        })
      }
    }

    return () => (
      <div class="book-list">
        {props.list.map(item => (
          <div class="list-item" key={item.id.toString()}>
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
            <div class="meta-wrapper">
              {item.accessTime && (
                <div class="progress">
                  <NProgress percentage={(item.percentage || 0) * 100} showIndicator={false} />
                </div>
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
                onSelect={key => {
                  if (key === 'delete') {
                    emit('delete', item.id)
                  }
                }}
              >
                <NButton class="more-button" text focusable={false}>
                  <SVGIcon size={24} name="ic_fluent_more_vertical_24_filled" />
                </NButton>
              </NDropdown>
              <div class="top">
                <div
                  class="ellipsis title"
                  style={{
                    'max-width': item.accessTime ? 'calc(100% - 96px)' : 'calc(100% - 32px)'
                  }}
                  onClick={() => emit('open', item.id)}
                >
                  {item.title}
                </div>
                <TextHover
                  text="作者"
                  placement="right-start"
                  content={() => (
                    <div
                      class="ellipsis creator"
                      onClick={() => item.creator && handleSearch(item.creator)}
                    >
                      {item.creator ? item.creator : '佚名'}
                    </div>
                  )}
                />
                <TextHover
                  text="出版社"
                  placement="right-start"
                  content={() => (
                    <div
                      class="ellipsis publisher"
                      onClick={() => item.publisher && handleSearch(item.publisher)}
                    >
                      {item.publisher ? item.publisher : '未知出版社'}
                    </div>
                  )}
                />
                <div class="description">{item.description ? item.description : '暂无简介'}</div>
              </div>
              <div class="bottom">
                <div class="info-item">
                  <div class="label">大小:</div>
                  <div class="value">{`${(item.size / 1048576).toFixed(2)}MB`}</div>
                </div>
                <div class="info-item">
                  <div class="label">MD5:</div>
                  <div class="value">{item.md5}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
})
