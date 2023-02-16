import _path from 'path/posix'

export class Container {
  packagePath = ''

  directory = ''

  async parse(containerDocument: XMLDocument) {
    const rootFile = containerDocument.querySelector('rootfile') as Element
    const packagePath = rootFile.getAttribute('full-path') as string
    // const directory = _path.dirname(packagePath)

    this.packagePath = packagePath
    // this.directory = directory === '.' ? '' : `${directory}/`
    this.directory = _path.dirname(packagePath)
  }
}
