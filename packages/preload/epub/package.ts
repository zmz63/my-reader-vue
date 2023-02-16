export type ManifestItem = {
  href: string
  overlay: string
  type: string
}

export type Manifest = Record<string, ManifestItem>

export type Spine = {
  id: string
  idref: string
  linear: string
  index: number
}[]

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
  [tag: string]: string
}

function parseManifest(manifestNode: Element) {
  const manifest: Manifest = {}

  for (const item of manifestNode.querySelectorAll('item')) {
    manifest[item.getAttribute('id') as string] = {
      href: item.getAttribute('href') || '',
      overlay: item.getAttribute('media-overlay') || '',
      type: item.getAttribute('media-type') || ''
    }
  }

  return manifest
}

function getNavPath(manifestNode: Element) {
  for (const item of manifestNode.querySelectorAll('item')) {
    if (item.getAttribute('properties') === 'nav') {
      return (item.getAttribute('href') as string) || ''
    }
  }

  return ''
}

function getNcxPath(manifestNode: Element, spineNode: Element) {
  for (const item of manifestNode.querySelectorAll('item')) {
    if (item.getAttribute('media-type') === 'application/x-dtbncx+xml') {
      return (item.getAttribute('href') as string) || ''
    }
  }

  if (spineNode.getAttribute('ncx')) {
    for (const item of manifestNode.querySelectorAll('item')) {
      if (item.getAttribute('id') === 'toc') {
        return (item.getAttribute('href') as string) || ''
      }
    }
  }

  return ''
}

function getCoverPath(manifestNode: Element, metadataNode: Element) {
  for (const item of manifestNode.querySelectorAll('item')) {
    if (item.getAttribute('properties') === 'cover-image') {
      return (item.getAttribute('href') as string) || ''
    }
  }

  for (const meta of metadataNode.querySelectorAll('meta')) {
    if (meta.getAttribute('name') === 'cover') {
      const id = meta.getAttribute('content')
      if (id) {
        const item = manifestNode.querySelector(`#${id}`)
        if (item) {
          return (item.getAttribute('href') as string) || ''
        }
      }
    }
  }

  return ''
}

function parseSpine(spineNode: Element) {
  const spine: Spine = []

  const nodeList = spineNode.querySelectorAll('itemref')
  for (let i = 0; i < nodeList.length; i++) {
    const item = nodeList[i]
    spine.push({
      id: item.getAttribute('id') || '',
      idref: item.getAttribute('idref') || '',
      linear: item.getAttribute('linear') || 'yes',
      index: i
    })
  }

  return spine
}

function parseMetadata(metadataNode: Element) {
  const metadata: Metadata = {
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
    rights: ''
  }

  for (const tag in metadata) {
    metadata[tag] =
      metadataNode.getElementsByTagNameNS(
        metadataNode.getAttribute('xmlns:dc') || 'http://purl.org/dc/elements/1.1/',
        tag
      )[0]?.textContent || ''
  }

  return metadata
}

export class Package {
  navPath = ''

  ncxPath = ''

  coverPath = ''

  manifest: Manifest = {}

  spine: Spine = []

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
    rights: ''
  }

  async parse(packageDocument: XMLDocument) {
    const metadataNode = packageDocument.querySelector('metadata') as Element
    const manifestNode = packageDocument.querySelector('manifest') as Element
    const spineNode = packageDocument.querySelector('spine') as Element

    this.manifest = parseManifest(manifestNode)
    this.navPath = getNavPath(manifestNode)
    this.ncxPath = getNcxPath(manifestNode, spineNode)
    this.coverPath = getCoverPath(manifestNode, metadataNode)
    this.spine = parseSpine(spineNode)
    this.metadata = parseMetadata(metadataNode)
  }
}
