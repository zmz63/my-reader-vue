import type { Defer } from '@packages/common/defer'

export type Container = {
  packagePath: string
  directory: string
  encoding: string
}

export type Package = {
  manifest: Manifest
  navPath: string
  ncxPath: string
  coverPath: string
  spine: Spine
  metadata: Partial<Metadata>
}

export type Manifest = Record<
  string,
  {
    href: string
    type: string
  }
>

export type Spine = {
  id: string
  idref: string
  linear: string
  index: number
}[]

export type Metadata = {
  title: string
  creator: string
  description: string
  publisher: string
}

export type EPubOpenOptions = {
  dump: boolean
}

declare global {
  class EPub {
    packagePath: string

    directory: string

    encoding: string

    manifest: Manifest

    navPath: string

    ncxPath: string

    coverPath: string

    spine: Spine

    metadata: Partial<Metadata>

    cover: Buffer | null

    path: string

    opened: Defer

    constructor(path?: string, options?: Partial<EPubOpenOptions>)

    open(path: string, options?: Partial<EPubOpenOptions>): Promise<void>
  }
}
