import { XMLParser } from 'fast-xml-parser'
import { openZipFile, zipFileEntryToBuffer } from '../zip'

const CONTAINER_PATH = 'META-INF/container.xml'
export class EPub {
  constructor(path: string) {
    this.parse(path)
  }

  async parse(path: string) {
    const { zipFile, entries } = await openZipFile(path)

    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      alwaysCreateTextNode: true
    })

    await zipFileEntryToBuffer(zipFile, entries[CONTAINER_PATH])

    zipFile.close()
  }

  parseContainer(buffer: Buffer, xmlParser: XMLParser) {
    //
  }
}
