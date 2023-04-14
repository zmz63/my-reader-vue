import { defineComponent, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NPagination } from 'naive-ui'
import type { BookMeta } from '@preload/channel/db'
import BooksShowcase from '@/components/BooksShowcase'
import './index.scss'

export default defineComponent({
  setup() {
    const route = useRoute()

    const bookList = reactive({
      data: [] as BookMeta[],
      count: 0
    })

    const pageData = reactive({
      isLoading: true,
      pageSize: 10,
      page: 1
    })

    const updateBookList = async (page = 1) => {
      if (!route.query.keyword) {
        return
      }

      try {
        pageData.isLoading = true
        pageData.page = page

        const offset = (page - 1) * pageData.pageSize
        const result = await dbChannel.getBookMetaListByKeyword(
          route.query.keyword as string,
          pageData.pageSize,
          offset
        )

        bookList.data = result.data
        bookList.count = result.count
      } finally {
        pageData.isLoading = false
      }
    }

    watch(
      () => route.query,
      (value, oldValue) => {
        if (oldValue && value.keyword === oldValue.keyword) {
          return
        }

        updateBookList()
      },
      {
        immediate: true
      }
    )

    return () => (
      <div class="search-page">
        <BooksShowcase list={bookList.data} loading={pageData.isLoading} onUpdate={updateBookList}>
          {{
            header: () => (
              <div class="search-page-header">
                <div class="page-title">搜索</div>
              </div>
            ),
            empty: () => <div class="search-page-empty">暂无结果~</div>,
            bottom: () =>
              bookList.count > pageData.pageSize && (
                <div class="pagination-wrapper">
                  <NPagination
                    itemCount={bookList.count}
                    pageSize={pageData.pageSize}
                    page={pageData.page}
                    pageSlot={5}
                    onUpdatePage={updateBookList}
                  />
                </div>
              )
          }}
        </BooksShowcase>
      </div>
    )
  }
})
