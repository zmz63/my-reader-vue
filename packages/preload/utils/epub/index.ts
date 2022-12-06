import { randomUUID } from 'crypto'
import { XMLParser } from 'fast-xml-parser'
import EPubView from './view'
import {
  getXmlObjectData,
  loadZipFile,
  parseDirectory,
  readZipFileToBuffer,
  replaceLink
} from '../common'
import type { Entry, ZipFile } from 'yauzl'
import type { BookMeta } from '../book'

type Manifest = Record<
  string,
  {
    href: string
    type: string
  }
>

type Navigation = {
  href: string
  label: string
  children?: Navigation[]
}

export type Section = {
  href: string
  text: string
  type: string
  blobUrl: string
  index: number
  prev: Section | null
  next: Section | null
}

export interface EPubMeta extends BookMeta {
  manifest: Manifest
  spine: string[]
  directory: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePackage(packaging: any) {
  const metadata = {} as {
    title: string
    creator: string
    description: string
    publisher: string
    cover: string
  }
  for (const key in packaging.metadata) {
    const data = packaging.metadata[key]
    if (key === 'dc:title') {
      metadata.title = getXmlObjectData(data)
    } else if (key === 'dc:creator') {
      metadata.creator = getXmlObjectData(data)
    } else if (key === 'dc:description') {
      metadata.description = getXmlObjectData(data)
    } else if (key === 'dc:publisher') {
      metadata.publisher = getXmlObjectData(data)
    } else if (key === 'meta') {
      metadata.cover = getXmlObjectData(data, 'content', item => item['name'] === 'cover')
    }
  }

  if (!metadata.cover) {
    for (const item of packaging.manifest['item']) {
      if (item['properties'] === 'cover-image') {
        metadata.cover = item['id']
        break
      }
    }
  }

  const manifest: Manifest = {}
  for (const item of packaging.manifest['item']) {
    manifest[item['id']] = {
      href: item['href'],
      type: item['media-type']
    }
  }

  const spine: string[] = []
  for (const item of packaging.spine['itemref']) {
    spine.push(manifest[item['idref']]['href'])
  }

  return {
    metadata,
    manifest,
    spine
  }
}

async function readResource(
  zipfile: ZipFile,
  entrys: Record<string, Entry>,
  directory: string,
  manifest: Manifest
) {
  const result: Record<string, Buffer> = {}

  const promises: Promise<void>[] = []
  for (const key in manifest) {
    promises.push(
      readZipFileToBuffer(zipfile, entrys[directory + manifest[key].href])
        .then(buffer => {
          result[key] = buffer
        })
        .catch(error => error)
    )
  }

  await Promise.all(promises)

  return result
}

function parseNavigation(
  manifest: Manifest,
  resources: Record<string, Buffer>,
  parser?: XMLParser
) {
  const navigations: Navigation[] = []

  if (!parser) {
    parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      alwaysCreateTextNode: true
    })
  }

  for (const key in manifest) {
    if (manifest[key].type === 'application/x-dtbncx+xml' && resources[key]) {
      const ncx = parser.parse(resources[key])['ncx']
      const navMap = ncx['navMap']
      if (navMap) {
        for (const item of navMap['navPoint']) {
          navigations.push({
            href: item['content']['src'],
            label: item['navLabel']['text']['#text']
          })
        }
        break
      }
    }
  }

  return navigations
}

class EPub {
  urls: string[] = []

  blobUrls: string[] = []

  start: Section

  sections: Record<string, Section> = {}

  views: Record<symbol, EPubView> = {}

  constructor(
    public meta: EPubMeta,
    resources: Record<string, Buffer>,
    public navigations: Navigation[]
  ) {
    const { manifest, spine } = meta
    const decoder = new TextDecoder()

    const sections: Record<string, [string, string]> = {}
    const styles: [string, string][] = []
    for (const key in manifest) {
      const { href, type } = manifest[key]
      const buffer = resources[key]

      if (type === 'application/xhtml+xml' || type === 'text/html') {
        sections[href] = [decoder.decode(buffer), type]
      } else if (type === 'text/css') {
        styles.push([href, decoder.decode(buffer)])
      } else {
        this.urls.push(href)
        this.blobUrls.push(URL.createObjectURL(new Blob([buffer], { type })))
      }
    }

    if (spine.length === 0) throw new Error('No Section')

    let prev: Section | null = null
    spine.forEach((href, index) => {
      const [text, type] = sections[href]

      const section: Section = {
        href,
        text,
        type,
        blobUrl: '',
        index,
        prev,
        next: null
      }

      if (prev) {
        prev.next = section
      }

      this.sections[href] = section
      prev = section
    })

    this.start = this.sections[spine[0]]

    styles.forEach(([href, style], index) => {
      styles[index][1] = replaceLink(href, style, this.urls, this.blobUrls)
    })

    for (const [href, style] of styles) {
      this.urls.push(href)
      this.blobUrls.push(URL.createObjectURL(new Blob([style], { type: 'text/css' })))
    }
  }

  createSectionUrl(section: Section) {
    if (section && section.text) {
      const content = replaceLink(section.href, section.text, this.urls, this.blobUrls)
      section.blobUrl = URL.createObjectURL(new Blob([content], { type: section.type }))
      section.text = ''
    }
  }

  render(container: HTMLElement) {
    const id = randomUUID()
    const view = new EPubView(this, container)
    view.render()

    return { id, view }
  }

  destroy() {
    for (const id of Object.getOwnPropertySymbols(this.views)) {
      this.views[id].destroy()
    }

    for (const blobUrl of this.blobUrls) {
      URL.revokeObjectURL(blobUrl)
    }

    for (const href in this.sections) {
      const { blobUrl } = this.sections[href]

      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }

  static load(meta: EPubMeta) {
    return new Promise<EPub>((resolve, reject) => {
      const { path, manifest, directory } = meta

      loadZipFile(path, async (error, zipfile, entrys) => {
        if (error || !entrys) return reject(error || new Error('File Format Exception'))

        try {
          if (!entrys['mimetype'] || !entrys['META-INF/container.xml']) {
            throw new Error('File Format Exception')
          }

          const resources = await readResource(zipfile, entrys, directory, manifest)
          const navigations = parseNavigation(manifest, resources)
          const ePub = new EPub(meta, resources, navigations)

          resolve(ePub)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  static import(path: string, name: string, complete: true): Promise<EPub>

  static import(path: string, name: string, complete: false): Promise<EPubMeta>

  static import(path: string, name: string, complete: true | false) {
    return new Promise<EPub | EPubMeta>((resolve, reject) => {
      loadZipFile(path, async (error, zipfile, entrys) => {
        if (error || !entrys) return reject(error || new Error('File Format Exception'))

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '',
          alwaysCreateTextNode: true
        })

        try {
          if (!entrys['mimetype'] || !entrys['META-INF/container.xml']) {
            throw new Error('File Format Exception')
          }

          let buffer: Buffer

          buffer = await readZipFileToBuffer(zipfile, entrys['META-INF/container.xml'])
          const container = parser.parse(buffer)['container']
          const packagePath = container['rootfiles']['rootfile']['full-path']
          const directory = parseDirectory(packagePath)

          buffer = await readZipFileToBuffer(zipfile, entrys[packagePath])
          const packaging = parser.parse(buffer)['package']
          const { metadata, manifest, spine } = parsePackage(packaging)

          let cover: Blob | undefined
          if (metadata.cover && manifest[metadata.cover]) {
            const coverPath = directory + manifest[metadata.cover]['href']
            buffer = await readZipFileToBuffer(zipfile, entrys[coverPath])
            cover = new Blob([buffer], { type: manifest[metadata.cover]['type'] })
          }

          const meta: EPubMeta = {
            id: randomUUID(),
            type: 'epub',
            path,
            title: metadata.title || name,
            creator: metadata.creator,
            description: metadata.description,
            publisher: metadata.publisher,
            cover,
            manifest,
            spine,
            directory
          }

          if (complete) {
            const resources = await readResource(zipfile, entrys, directory, manifest)
            const navigations = parseNavigation(manifest, resources, parser)
            const ePub = new EPub(meta, resources, navigations)

            resolve(ePub)
          } else {
            resolve(meta)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}

export default EPub
