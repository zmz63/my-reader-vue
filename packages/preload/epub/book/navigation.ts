import type { ZipArchive } from '@preload/utils/zip-archive'

export type TocItem = {
  id: string
  href: string
  label: string
  subitems: TocItem[]
  parent: string | null
}

export class Navigation {
  list: TocItem[] = []

  async parseNcx(archive: ZipArchive, ncxPath: string) {
    const ncxDocument = await archive.getXMLDocument(ncxPath)
    const navMapNode = ncxDocument.querySelector('navMap') as Element
    const navPoints = navMapNode.querySelectorAll('navPoint')

    const tocMap: Record<string, TocItem> = {}

    const parseNcxItem = (navPoint: Element) => {
      const content = navPoint.querySelector('content') as Element
      const navLabel = navPoint.querySelector('navLabel') as Element
      const parentNode = navPoint.parentNode as Element
      let parent: string | null = null

      if (
        parentNode &&
        (parentNode.nodeName === 'navPoint' ||
          parentNode.nodeName.split(':').slice(-1)[0] === 'navPoint')
      ) {
        parent = parentNode.getAttribute('id')
      }

      return {
        id: navPoint.getAttribute('id') || '',
        href: content.getAttribute('src') || '',
        label: navLabel.textContent || '',
        subitems: [],
        parent
      } as TocItem
    }

    for (const navPoint of navPoints) {
      const item = parseNcxItem(navPoint)
      tocMap[item.id] = item
      if (item.parent) {
        tocMap[item.parent].subitems.push(item)
      } else {
        this.list.push(item)
      }
    }
  }

  async parseNav(archive: ZipArchive, navPath: string) {
    const navDocument = await archive.getXMLDocument(navPath)
    // TODO
  }
}
