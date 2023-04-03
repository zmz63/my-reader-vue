import type { Spine, View, Views } from '.'

export type SearchResult = Map<number, Range[]>

export class Searcher {
  spine: Spine

  views: Views

  seq = 0

  result: SearchResult = new Map()

  constructor(spine: Spine, views: Views) {
    this.spine = spine
    this.views = views
  }

  mark(view?: View) {
    if (view) {
      const index = view.section.index
      const ranges = this.result.get(index)

      if (ranges) {
        for (const range of ranges) {
          view.mark(range, 'book-mark-search')
        }
      }
    } else {
      this.views.forEach(view => {
        this.mark(view)
      })
    }
  }

  clear() {
    this.views.forEach(view => {
      const ranges = this.result.get(view.section.index)
      if (ranges) {
        for (const range of ranges) {
          view.unMark(range)
        }
      }
    })

    this.seq += 1
    this.result.clear()
  }

  *search(keyword: string, max = 100, index?: number) {
    this.clear()

    if (!keyword) {
      return
    }

    keyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

    const sections = typeof index === 'number' ? [this.spine.sections[index]] : this.spine.sections
    const seq = this.seq
    let result: SearchResult = new Map()
    let n = 0

    for (const section of sections) {
      const treeWalker = section.document.createTreeWalker(
        section.document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: node =>
            (node.textContent as string).trim()
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT
        }
      )

      let node: Node | null
      while ((node = treeWalker.nextNode())) {
        if (seq !== this.seq) {
          return
        }

        const matches = (node.textContent as string).matchAll(new RegExp(keyword, 'g'))
        for (const match of matches) {
          if (match.index !== undefined) {
            const index = section.index
            const range = section.document.createRange()
            range.setStart(node, match.index)
            range.setEnd(node, match.index + keyword.length)

            this.views.forEach(view => {
              if (section === view.section) {
                view.mark(range, 'book-mark-search')
              }
            })

            if (result.has(index)) {
              void (result.get(index) as Range[]).push(range)
            } else {
              result.set(index, [range])
            }

            if (this.result.has(index)) {
              void (this.result.get(index) as Range[]).push(range)
            } else {
              this.result.set(index, [range])
            }

            n += 1

            if (seq !== this.seq) {
              return
            } else if (n >= max) {
              yield result

              n = 0
              result = new Map()
            }
          }
        }
      }
    }

    if (seq !== this.seq) {
      return
    } else if (result.size) {
      yield result
    }
  }
}
