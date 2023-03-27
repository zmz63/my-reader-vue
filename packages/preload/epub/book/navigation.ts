import _path from 'path/posix'
import type { ZipArchive } from '@preload/utils/zip-archive'
import type { Spine } from './spine'

export type TocItem = {
  id: string
  index: number
  href: string
  label: string
  subitems: TocItem[]
  parent: string | null
}

export class Navigation {
  list: TocItem[] = []

  directory = ''

  resolve(path: string) {
    return _path.join(this.directory, path)
  }

  static async parseNcx(inst: Navigation, archive: ZipArchive, ncxPath: string, spine: Spine) {
    const ncxDocument = await archive.getXMLDocument(ncxPath)
    const navMapElement = ncxDocument.querySelector('navMap') as Element
    const navPoints = navMapElement.querySelectorAll('navPoint')

    inst.directory = _path.dirname(ncxPath)

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

      const src = content.getAttribute('src')
      const href = src ? inst.resolve(src) : ''

      return {
        id: navPoint.getAttribute('id') || '',
        index: spine.hrefMap[href] || -1,
        href,
        label: navLabel.textContent?.trim() || '',
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
        inst.list.push(item)
      }
    }
  }

  static async parseNav(inst: Navigation, archive: ZipArchive, navPath: string, spine: Spine) {
    const navDocument = await archive.getXMLDocument(navPath)
    // TODO
  }
}
