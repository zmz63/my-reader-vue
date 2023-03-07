import type { ZipArchive } from '@preload/utils/zip-archive'
import { indexOfNode } from '../utils'

export type ManifestItem = {
  href: string
  overlay: string
  type: string
  properties: string[]
}

export type SpineItem = {
  idref: string
  linear: string
  index: number
  id: string
  properties: string[]
}

export type Metadata = {
  title: string
  creator: string
  subject: string
  description: string
  date: string
  type: string
  publisher: string
  contributor: string
  format: string
  identifier: string
  source: string
  language: string
  relation: string
  coverage: string
  rights: string
  layout: string
  orientation: string
  flow: string
  viewport: string
  spread: string
  direction: string
}

export class Package {
  navPath = ''

  ncxPath = ''

  coverPath = ''

  manifest: Record<string, ManifestItem> = {}

  spine: SpineItem[] = []

  metadata: Metadata = {
    title: '',
    creator: '',
    subject: '',
    description: '',
    date: '',
    type: '',
    publisher: '',
    contributor: '',
    format: '',
    identifier: '',
    source: '',
    language: '',
    relation: '',
    coverage: '',
    rights: '',
    layout: '',
    orientation: '',
    flow: '',
    viewport: '',
    spread: '',
    direction: ''
  }

  spineNodeIndex = 0

  async parse(archive: ZipArchive, packagePath: string) {
    try {
      const packageDocument = await archive.getXMLDocument(packagePath)
      const metadataNode = packageDocument.querySelector('metadata') as Element
      const manifestNode = packageDocument.querySelector('manifest') as Element
      const spineNode = packageDocument.querySelector('spine') as Element

      this.parseManifest(manifestNode)
      this.getNavPath(manifestNode)
      this.getNcxPath(manifestNode, spineNode)
      this.getCoverPath(manifestNode, metadataNode)
      this.parseSpine(spineNode)
      this.parseMetadata(metadataNode, spineNode)
      this.spineNodeIndex = indexOfNode(spineNode, Node.ELEMENT_NODE)
    } catch (error) {
      // TODO
      throw new Error()
    }
  }

  private parseManifest(manifestNode: Element) {
    for (const item of manifestNode.querySelectorAll('item')) {
      this.manifest[item.getAttribute('id') as string] = {
        href: item.getAttribute('href') || '',
        overlay: item.getAttribute('media-overlay') || '',
        type: item.getAttribute('media-type') || '',
        properties: item.getAttribute('properties')?.split(' ') || []
      }
    }
  }

  private getNavPath(manifestNode: Element) {
    for (const item of manifestNode.querySelectorAll('item')) {
      if (item.getAttribute('properties') === 'nav') {
        this.navPath = (item.getAttribute('href') as string) || ''
      }
    }
  }

  private getNcxPath(manifestNode: Element, spineNode: Element) {
    for (const item of manifestNode.querySelectorAll('item')) {
      if (item.getAttribute('media-type') === 'application/x-dtbncx+xml') {
        this.ncxPath = (item.getAttribute('href') as string) || ''
      }
    }

    if (spineNode.getAttribute('ncx')) {
      for (const item of manifestNode.querySelectorAll('item')) {
        if (item.getAttribute('id') === 'toc') {
          this.ncxPath = (item.getAttribute('href') as string) || ''
        }
      }
    }
  }

  private getCoverPath(manifestNode: Element, metadataNode: Element) {
    for (const item of manifestNode.querySelectorAll('item')) {
      if (item.getAttribute('properties') === 'cover-image') {
        this.coverPath = (item.getAttribute('href') as string) || ''
      }
    }

    for (const meta of metadataNode.querySelectorAll('meta')) {
      if (meta.getAttribute('name') === 'cover') {
        const id = meta.getAttribute('content')
        if (id) {
          const item = manifestNode.querySelector(`#${id}`)
          if (item) {
            this.coverPath = (item.getAttribute('href') as string) || ''
          }
        }
      }
    }
  }

  private parseSpine(spineNode: Element) {
    const nodeList = spineNode.querySelectorAll('itemref')
    nodeList.forEach((item, index) => {
      this.spine.push({
        idref: item.getAttribute('idref') || '',
        linear: item.getAttribute('linear') || 'yes',
        index,
        id: item.getAttribute('id') || '',
        properties: item.getAttribute('properties')?.split(' ') || []
      })
    })
  }

  private parseMetadata(metadataNode: Element, spineNode: Element) {
    const dcTags = [
      'title',
      'creator',
      'subject',
      'description',
      'date',
      'type',
      'publisher',
      'contributor',
      'format',
      'identifier',
      'source',
      'language',
      'relation',
      'coverage',
      'rights'
    ]
    const renditionProps = ['layout', 'orientation', 'flow', 'viewport', 'spread']

    for (const tag of dcTags as (keyof Metadata)[]) {
      this.metadata[tag] =
        metadataNode.getElementsByTagNameNS(
          metadataNode.getAttribute('xmlns:dc') || 'http://purl.org/dc/elements/1.1/',
          tag
        )[0]?.textContent || ''
    }

    const metaNodes = metadataNode.querySelectorAll('meta')
    for (const prop of renditionProps as (keyof Metadata)[]) {
      for (const meta of metaNodes) {
        if (meta.getAttribute('property') === `rendition:${prop}`) {
          if (meta.textContent) {
            this.metadata[prop] = meta.textContent
          }
          break
        }
      }
    }

    this.metadata.direction = spineNode.getAttribute('page-progression-direction') || ''
  }
}
