/* eslint-disable @typescript-eslint/no-explicit-any */
import _path from 'path'
import { XMLParser } from 'fast-xml-parser'
import type yauzl from 'yauzl'
import { type ZipEntries, openZipFile, zipFileEntryToBuffer } from '../zip'
import { getElementAttribute, getElementText } from '../xml'
import type { Container, EPubOpenOptions, Manifest, Metadata, Package, Spine } from './types'
import { Defer } from '@packages/common/defer'

const CONTAINER_PATH = 'META-INF/container.xml'

async function parseContainer(zipFile: yauzl.ZipFile, entries: ZipEntries, parser: XMLParser) {
  const buffer = await zipFileEntryToBuffer(zipFile, entries[CONTAINER_PATH])
  const containerNode = parser.parse(buffer)['container']
  const packagePath = containerNode['rootfiles']['rootfile']['full-path']
  const directory = `${_path.dirname(packagePath)}/`

  return {
    packagePath,
    directory,
    encoding: 'UTF-8'
  } as Container
}

function parseManifest(manifestNode: any) {
  const manifest: Manifest = {}
  for (const item of manifestNode['item']) {
    manifest[item['id']] = {
      href: item['href'],
      type: item['media-type']
    }
  }

  return manifest
}

function getNavPath(manifestNode: any) {
  for (const item of manifestNode['item']) {
    if (item['properties'] === 'nav') {
      return (item['href'] as string) || ''
    }
  }

  return ''
}

function getNcxPath(manifestNode: any, spineNode: any) {
  for (const item of manifestNode['item']) {
    if (item['media-type'] === 'application/x-dtbncx+xml') {
      return (item['href'] as string) || ''
    }
  }

  if (spineNode['toc']) {
    for (const item of manifestNode['item']) {
      if (item['id'] === 'toc') {
        return (item['href'] as string) || ''
      }
    }
  }

  return ''
}

function getCoverPath(manifestNode: any, metadataNode: any) {
  for (const item of manifestNode['item']) {
    if (item['properties'] === 'cover-image') {
      return (item['href'] as string) || ''
    }
  }

  for (const key in metadataNode) {
    if (key === 'meta') {
      const id = getElementAttribute(metadataNode[key], 'content', item => item['name'] === 'cover')
      if (id) {
        for (const item of manifestNode['item']) {
          if (item['id'] === id) {
            return (item['href'] as string) || ''
          }
        }
      }

      return ''
    }
  }
}

function parseSpine(spineNode: any) {
  const spine: Spine = []
  for (let i = 0; i < spineNode['itemref'].length; i++) {
    const item = spineNode['itemref'][i]
    spine.push({
      id: item['id'],
      idref: item['idref'],
      linear: item['linear'] || 'yes',
      index: i
    })
  }

  return spine
}

function parseMetadata(metadataNode: any) {
  const metadata: Partial<Metadata> = {}
  for (const key in metadataNode) {
    const node = metadataNode[key]
    if (key === 'dc:title') {
      metadata.title = getElementText(node)
    } else if (key === 'dc:creator') {
      metadata.creator = getElementText(node)
    } else if (key === 'dc:description') {
      metadata.description = getElementText(node)
    } else if (key === 'dc:publisher') {
      metadata.publisher = getElementText(node)
    }
  }

  return metadata
}

async function parsePackage(
  packagePath: string,
  zipFile: yauzl.ZipFile,
  entries: ZipEntries,
  parser: XMLParser
) {
  const buffer = await zipFileEntryToBuffer(zipFile, entries[packagePath])
  const packageNode = parser.parse(buffer)['package']
  const metadataNode = packageNode['metadata']
  const manifestNode = packageNode['manifest']
  const spineNode = packageNode['spine']

  const manifest = parseManifest(manifestNode)
  const navPath = getNavPath(manifestNode)
  const ncxPath = getNcxPath(manifestNode, spineNode)
  const coverPath = getCoverPath(manifestNode, metadataNode)
  const spine = parseSpine(spineNode)
  const metadata = parseMetadata(metadataNode)

  return {
    manifest,
    navPath,
    ncxPath,
    coverPath,
    spine,
    metadata
  } as Package
}

export class EPub {
  packagePath = ''

  directory = ''

  encoding = ''

  manifest: Manifest = {}

  navPath = ''

  ncxPath = ''

  coverPath = ''

  spine: Spine = []

  metadata: Partial<Metadata> = {}

  cover: Buffer | null = null

  path = ''

  opened = new Defer()

  constructor(path?: string, options?: Partial<EPubOpenOptions>) {
    if (path) {
      this.open(path, options)
    }
  }

  async open(path: string, options?: Partial<EPubOpenOptions>) {
    try {
      const { zipFile, entries } = await openZipFile(path)

      const xmlParser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        alwaysCreateTextNode: true
      })

      const { packagePath, directory, encoding } = await parseContainer(zipFile, entries, xmlParser)
      const { manifest, navPath, ncxPath, coverPath, spine, metadata } = await parsePackage(
        packagePath,
        zipFile,
        entries,
        xmlParser
      )

      if (coverPath) {
        this.cover = await zipFileEntryToBuffer(zipFile, entries[directory + coverPath])
      }

      if (options && options.dump) {
        // TODO
      }

      this.packagePath = packagePath
      this.directory = directory
      this.encoding = encoding

      this.manifest = manifest
      this.navPath = navPath
      this.ncxPath = ncxPath
      this.coverPath = coverPath
      this.spine = spine
      this.metadata = metadata

      this.path = path
      this.opened.resolve?.()

      zipFile.close()
    } catch (error) {
      this.opened.reject?.(error)
    }
  }

  dump() {
    // TODO
  }

  destroy() {
    // TODO
  }
}
