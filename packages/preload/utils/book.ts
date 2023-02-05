/* eslint-disable @typescript-eslint/no-explicit-any */
import { parse } from 'path'
import { ipcRenderer } from 'electron'
import EPub, { type EPubMeta } from './epub2'

function selectBook() {
  return ipcRenderer.invoke('book-select') as Promise<string[] | undefined>
}

export interface BookMeta {
  id: string
  type: string
  path: string
  title: string
  creator?: string
  description?: string
  publisher?: string
  cover?: Blob
}

abstract class View {
  abstract prev(): void

  abstract next(): void

  abstract destroy(): void
}

abstract class Book {
  abstract meta: BookMeta

  abstract render(container: HTMLElement): {
    id: string
    view: View
  }

  abstract destroy(): void
}

type BookInfo = {
  loaded: boolean
  book?: Book
  meta?: BookMeta
}

const pathSet = new Set<string>()

const bookMap = new Map<string, BookInfo>()

const viewMap = new Map<string, View>()

async function importBook(open = false, path?: string) {
  const result: BookMeta[] = []
  const errors: {
    path: string
    error: any
  }[] = []
  const paths: string[] = []

  if (path) {
    paths.push(path)
  } else {
    paths.push(...((await selectBook()) || []))
  }

  const promises: Promise<void>[] = []
  let promise: Promise<void>
  for (const path of paths) {
    if (pathSet.has(path)) {
      errors.push({ path, error: { type: 0, info: new Error('File Already Exist') } })
      continue
    }

    pathSet.add(path)

    const { name, ext } = parse(path)

    if (ext === '.epub') {
      if (open) {
        promise = EPub.import(path, name, true).then(ePub => {
          const { meta } = ePub

          bookMap.set(meta.id, { loaded: true, book: ePub })
          result.push(meta)
        })
      } else {
        promise = EPub.import(path, name, false).then(meta => {
          bookMap.set(meta.id, { loaded: true, meta })
          result.push(meta)
        })
      }

      promises.push(
        promise.catch(error => {
          pathSet.delete(path)
          errors.push({ path, error: { type: 1, info: error } })
        })
      )
    }
  }

  await Promise.all(promises)

  return { result, errors }
}

async function renderBook(id: string, container: HTMLElement) {
  const data = bookMap.get(id)

  if (!data) throw new Error('Book Does Not Exist')

  if (data.loaded) {
    const book = data.book as Book
    const { id, view } = book.render(container)

    viewMap.set(id, view)

    return id
  } else {
    const meta = data.meta as BookMeta

    if (meta.type === 'epub') {
      const epub = await EPub.load(meta as EPubMeta)
      const { id, view } = epub.render(container)

      viewMap.set(id, view)

      return id
    } else {
      throw new Error('Book Type Does Not Exist')
    }
  }
}

function destroyBook(id: string) {
  const data = bookMap.get(id)

  if (!data || !data.loaded) return

  const book = data.book as Book

  book.destroy()
}

type ViewOperationType = 'prev' | 'next'

function manageView(id: string, type: ViewOperationType) {
  const view = viewMap.get(id)

  if (!view) return

  switch (type) {
    case 'prev':
      view.prev()
      break
    case 'next':
      view.next()
      break
    default:
      break
  }
}

function destroyView(id: string) {
  const view = viewMap.get(id)

  if (!view) return

  view.destroy()
}

const bookUtil = {
  importBook,
  renderBook,
  destroyBook,
  manageView,
  destroyView
}

export type BookUtil = typeof bookUtil

export default bookUtil
