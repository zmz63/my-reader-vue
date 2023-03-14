import type { ZipArchive } from '@preload/utils/zip-archive'
import { indexOfNode } from '..'
import type { Container } from './container'

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

  cover: Buffer | null = null

  manifest: Record<string, ManifestItem> = {}

  spine: SpineItem[] = []

  metadata: Partial<Metadata> = {}

  spineNodeIndex = 0

  static async parse(inst: Package, archive: ZipArchive, container: Container) {
    try {
      const packageDocument = await archive.getXMLDocument(container.packagePath)
      const metadataElement = packageDocument.querySelector('metadata') as Element
      const manifestElement = packageDocument.querySelector('manifest') as Element
      const spineElement = packageDocument.querySelector('spine') as Element

      inst.manifest = this.parseManifest(manifestElement)
      inst.navPath = this.getNavPath(manifestElement)
      inst.ncxPath = this.getNcxPath(manifestElement, spineElement)
      inst.coverPath = this.getCoverPath(manifestElement, metadataElement)
      inst.spine = this.parseSpine(spineElement)
      inst.metadata = this.parseMetadata(metadataElement, spineElement)
      inst.spineNodeIndex = indexOfNode(spineElement, Node.ELEMENT_NODE)

      if (inst.coverPath) {
        inst.cover = await archive.getBuffer(container.resolve(inst.coverPath))
      }
    } catch (error) {
      // TODO
      throw new Error()
    }
  }

  static parseManifest(manifestElement: Element) {
    const manifest: Record<string, ManifestItem> = {}

    for (const item of manifestElement.querySelectorAll('item')) {
      manifest[item.getAttribute('id') as string] = {
        href: item.getAttribute('href') || '',
        overlay: item.getAttribute('media-overlay') || '',
        type: item.getAttribute('media-type') || '',
        properties: item.getAttribute('properties')?.split(' ') || []
      }
    }

    return manifest
  }

  static getNavPath(manifestElement: Element) {
    for (const item of manifestElement.querySelectorAll('item')) {
      if (item.getAttribute('properties') === 'nav') {
        return (item.getAttribute('href') as string) || ''
      }
    }

    return ''
  }

  static getNcxPath(manifestElement: Element, spineElement: Element) {
    for (const item of manifestElement.querySelectorAll('item')) {
      if (item.getAttribute('media-type') === 'application/x-dtbncx+xml') {
        return (item.getAttribute('href') as string) || ''
      }
    }

    if (spineElement.getAttribute('ncx')) {
      for (const item of manifestElement.querySelectorAll('item')) {
        if (item.getAttribute('id') === 'toc') {
          return (item.getAttribute('href') as string) || ''
        }
      }
    }

    return ''
  }

  static getCoverPath(manifestElement: Element, metadataElement: Element) {
    for (const item of manifestElement.querySelectorAll('item')) {
      if (item.getAttribute('properties') === 'cover-image') {
        return (item.getAttribute('href') as string) || ''
      }
    }

    for (const meta of metadataElement.querySelectorAll('meta')) {
      if (meta.getAttribute('name') === 'cover') {
        const id = meta.getAttribute('content')
        if (id) {
          const item = manifestElement.querySelector(`#${id}`)
          if (item) {
            return (item.getAttribute('href') as string) || ''
          }
        }
      }
    }

    return ''
  }

  static parseSpine(spineElement: Element) {
    const spine: SpineItem[] = []

    const elementList = spineElement.querySelectorAll('itemref')
    elementList.forEach((item, index) => {
      spine.push({
        idref: item.getAttribute('idref') || '',
        linear: item.getAttribute('linear') || 'yes',
        index,
        id: item.getAttribute('id') || '',
        properties: item.getAttribute('properties')?.split(' ') || []
      })
    })

    return spine
  }

  static parseMetadata(metadataElement: Element, spineElement: Element) {
    const metadata: Partial<Metadata> = {}
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
      const element = metadataElement.getElementsByTagNameNS(
        metadataElement.getAttribute('xmlns:dc') || 'http://purl.org/dc/elements/1.1/',
        tag
      )[0]
      if (element) {
        metadata[tag] = element.textContent || ''
      }
    }

    const metaElements = metadataElement.querySelectorAll('meta')
    for (const prop of renditionProps as (keyof Metadata)[]) {
      for (const meta of metaElements) {
        if (meta.getAttribute('property') === `rendition:${prop}`) {
          if (meta.textContent) {
            metadata[prop] = meta.textContent
          }
          break
        }
      }
    }

    const direction = spineElement.getAttribute('page-progression-direction')
    if (direction) {
      metadata.direction = direction
    }

    return metadata
  }
}
