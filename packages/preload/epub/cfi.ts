export class CFI {
  static isCFI(fragment: string) {
    return typeof fragment === 'string' && fragment.startsWith('epubcfi(') && fragment.endsWith(')')
  }

  static parse(fragment: string) {
    //
  }

  static parseComponent() {
    //
  }

  static generateChapterFragment(spineNodeIndex: number, sectionIndex: number, sectionId: string) {
    let fragment = `/${(spineNodeIndex + 1) * 2}/${(sectionIndex + 1) * 2}`

    if (sectionId) {
      fragment += `[${sectionId}]`
    }

    return fragment
  }

  static rangeToCFI(range: Range, cfiBase: string) {
    //
  }
}
