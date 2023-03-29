import { defineComponent, reactive, ref } from 'vue'
import { format, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns'
import type { BookData, BookMeta } from '@preload/channel/db'
import Search from '@/components/Search'
import BooksShowcase from '@/components/BooksShowcase'
import './index.scss'
import { NCollapse, NCollapseItem, NScrollbar } from 'naive-ui'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const router = useRouter()

    const phases = ['day', 'week', 'month', 'year', 'ago']

    const phaseNames = ['今天', '本周', '本月', '今年', '很久以前']

    const recentBooks = reactive<Record<'day' | 'week' | 'month' | 'year' | 'ago', BookMeta[]>>({
      day: [],
      week: [],
      month: [],
      year: [],
      ago: []
    })

    const isEmpty = ref(true)

    const getRecentBookList = async () => {
      const list = await dbChannel.getRecentBookMetaList()

      if (list.length) {
        isEmpty.value = false
      } else {
        isEmpty.value = true
      }

      console.log('list', list)

      const now = new Date()
      const day = startOfDay(now)
      const week = startOfWeek(now)
      const month = startOfMonth(now)
      const year = startOfYear(now)

      for (const book of list) {
        const date = new Date(book.accessTime || now)

        if (date > day) {
          recentBooks.day.push(book)
        } else if (date > week) {
          recentBooks.week.push(book)
        } else if (date > month) {
          recentBooks.month.push(book)
        } else if (date > year) {
          recentBooks.year.push(book)
        } else {
          recentBooks.ago.push(book)
        }
      }
    }

    getRecentBookList()

    const openBook = (id: number | bigint) => {
      router.push({
        name: 'READER',
        query: {
          id: id.toString()
        }
      })
    }

    return () => (
      <div class="recent-page">
        {isEmpty.value ? (
          <div>hello</div>
        ) : (
          <>
            <div class="recent-page-header">
              <div class="title">标题</div>
              <div class="creator">作者</div>
              <div class="time">阅读时长</div>
              <div class="progress">进度</div>
              <div class="date">日期</div>
            </div>
            <NScrollbar>
              <NCollapse defaultExpandedNames={phases}>
                {phases.map((phase, index) =>
                  recentBooks[phase as keyof typeof recentBooks].length ? (
                    <NCollapseItem title={phaseNames[index]} name={phase} key={phase}>
                      <div class="books-group">
                        {recentBooks[phase as keyof typeof recentBooks].map(item => (
                          <div
                            class="book-item"
                            onClick={() => openBook(item.rowid)}
                            key={item.rowid.toString()}
                          >
                            <div class="ellipsis title">{item.title}</div>
                            <div class="ellipsis creator">{item.creator}</div>
                            <div class="time">123</div>
                            <div class="progress">123</div>
                            <div class="ellipsis date">
                              {format(item.accessTime as number, 'yyyy/MM/dd HH:mm')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </NCollapseItem>
                  ) : null
                )}
              </NCollapse>
            </NScrollbar>
          </>
        )}
      </div>
    )
  }
})
