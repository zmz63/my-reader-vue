import type { ZipArchive } from '@preload/utils/zip-archive'

export class Navigation {
  async parseNcx(archive: ZipArchive, ncxPath: string) {
    const ncxDocument = await archive.getXMLDocument(ncxPath)
    const navMapNode = ncxDocument.querySelector('navMap') as Element
    const navPoints = navMapNode.querySelectorAll('navPoint')

    const parseNcxItem = (navPoint: Element) => {
      //
    }

    for (const navPoint of navPoints) {
      parseNcxItem(navPoint)
    }
  }

  async parseNav(archive: ZipArchive, navPath: string) {
    const navDocument = await archive.getXMLDocument(navPath)
    // TODO
  }
}
