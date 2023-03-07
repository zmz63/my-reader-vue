import _path from 'path/posix'
import type { ZipArchive } from '@preload/utils/zip-archive'

export class Container {
  packagePath = ''

  directory = ''

  async parse(archive: ZipArchive, containerPath: string) {
    try {
      const containerDocument = await archive.getXMLDocument(containerPath)
      const rootFile = containerDocument.querySelector('rootfile') as Element
      const packagePath = rootFile.getAttribute('full-path') as string

      this.packagePath = packagePath
      this.directory = _path.dirname(packagePath)
    } catch (error) {
      // TODO
      throw new Error()
    }
  }
}
