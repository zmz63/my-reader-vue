import { indexOfNode } from './utils'

export type CFIStep = {
  type: number
  index: number
  assertion?: string
}

export type CFIPath = {
  steps: CFIStep[]
  offset: number
  assertion?: string
}

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

  static steps(node: Node) {
    const steps: CFIStep[] = []
    let currentNode = node

    while (
      currentNode &&
      currentNode.parentNode &&
      currentNode.parentNode.nodeType !== Node.DOCUMENT_NODE
    ) {
      const step: CFIStep = {
        type: currentNode.nodeType,
        index: indexOfNode(currentNode, currentNode.nodeType)
      }

      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        step.assertion = (currentNode as Element).id
      }

      steps.push(step)

      currentNode = currentNode.parentNode
    }

    return steps.reverse()
  }

  static stepsToString(steps: CFIStep[]) {
    return steps
      .map(step => {
        let fragment = `/${
          step.type === Node.ELEMENT_NODE ? (step.index + 1) * 2 : step.index * 2 + 1
        }`

        if (step.assertion) {
          fragment += `[${step.assertion}]`
        }

        return fragment
      })
      .join('')
  }

  static path(node: Node, offset: number) {
    const steps = this.steps(node)

    const path: CFIPath = {
      steps,
      offset
    }

    return path
  }

  static pathToString(path: CFIPath) {
    let fragment = this.stepsToString(path.steps)

    if (path.offset !== undefined) {
      fragment += `:${path.offset}`
    }

    if (path.assertion) {
      fragment += `[${path.assertion}]`
    }

    return fragment
  }

  static rangeToCFI(range: Range, base: string) {
    const path = this.path(range.startContainer, range.startOffset)

    const fragments = []

    fragments.push('epubcfi(')
    fragments.push(base)
    fragments.push('!')
    fragments.push(this.pathToString(path))
    fragments.push(')')

    return fragments.join('')
  }

  static cfiToRange(cfi: string) {
    //
  }
}
