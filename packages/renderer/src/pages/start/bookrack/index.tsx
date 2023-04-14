import { defineComponent, reactive } from 'vue'
import { NButton, NPagination } from 'naive-ui'
import type { BookData, BookMeta } from '@preload/channel/db'
import BooksShowcase from '@/components/BooksShowcase'
import './index.scss'

export default defineComponent({
  setup() {
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
      try {
        pageData.isLoading = true
        pageData.page = page

        const offset = (page - 1) * pageData.pageSize
        const result = await dbChannel.getBookMetaList(pageData.pageSize, offset)

        bookList.data = result.data
        bookList.count = result.count
      } finally {
        pageData.isLoading = false
      }
    }

    updateBookList()

    const importBooks = async () => {
      const paths = await appChannel.selectOpenFilePaths({
        filters: [{ name: 'Electronic Book', extensions: ['epub'] }],
        properties: ['multiSelections']
      })

      if (!paths) {
        return
      }

      const openBook = async (path: string) => {
        const file = await preloadUtil.openFile(path)
        const book = new ePub.Book(file, false)

        await book.opened

        const { title, creator, description, date, publisher, identifier } = book.package.metadata

        const bookData: Omit<BookData, 'id'> = {
          md5: preloadUtil.md5(file),
          size: file.byteLength,
          createTime: Math.floor(Date.now() / 1000),
          file,
          title,
          cover: book.package.cover,
          creator,
          description,
          date,
          publisher,
          identifier
        }

        const result = await dbChannel.insertBook(bookData)

        return result
      }

      const promises: Promise<unknown>[] = []
      for (const path of paths) {
        promises.push(openBook(path))
      }

      await Promise.allSettled(promises)

      updateBookList()
    }

    return () => (
      <div class="bookrack-page">
        <BooksShowcase list={bookList.data} loading={pageData.isLoading} onUpdate={updateBookList}>
          {{
            header: () => (
              <div class="bookrack-page-header">
                <div class="page-title">书架</div>
                <NButton type="primary" onClick={importBooks}>
                  导入
                </NButton>
              </div>
            ),
            empty: () => <div class="bookrack-page-empty">书架上还没有书, 快导入几本书试试吧~</div>,
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
