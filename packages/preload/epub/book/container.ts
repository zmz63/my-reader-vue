import _path from 'path/posix'
import type { ZipArchive } from '@preload/utils/zip-archive'

export class Container {
  packagePath = ''

  directory = ''

  resolve(path: string) {
    return _path.join(this.directory, path)
  }

  static async parse(inst: Container, archive: ZipArchive, containerPath: string) {
    try {
      const containerDocument = await archive.getXMLDocument(containerPath)
      const rootFileElement = containerDocument.querySelector('rootfile') as Element
      const packagePath = rootFileElement.getAttribute('full-path') as string

      inst.packagePath = packagePath
      inst.directory = _path.dirname(packagePath)
    } catch (error) {
      // TODO
      throw new Error()
    }
  }
}
