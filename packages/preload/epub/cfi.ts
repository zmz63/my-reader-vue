import { getNodeByIndex, indexOfNode } from './util'

export type CFIStep = {
  type: number
  index: number
  assertion?: string
}

export type CFIPath = {
  steps: CFIStep[]
  offset?: number
  assertion?: string
}

export class CFI {
  static isCFI(fragment: unknown) {
    return typeof fragment === 'string' && fragment.startsWith('epubcfi(') && fragment.endsWith(')')
  }

  static parseSteps(fragment: string) {
    const fragments = fragment.split('/')

    if (fragments[0] === '') {
      fragments.shift()
    }

    const steps = fragments.map(fragment => {
      const n = parseInt(fragment)

      const step: CFIStep =
        n % 2 === 0
          ? { index: n / 2 - 1, type: Node.ELEMENT_NODE }
          : { index: (n - 1) / 2, type: Node.TEXT_NODE }

      const matches = fragment.match(/\[(.*?)\]/)

      if (matches && matches[1]) {
        step.assertion = matches[1]
      }

      return step
    })

    return steps
  }

  static parsePath(fragment: string) {
    const parts = fragment.split(':')

    const path: CFIPath = {
      steps: this.parseSteps(parts[0])
    }

    if (parts[1]) {
      path.offset = parseInt(parts[1])
    }

    return path
  }

  static pathToRange(path: CFIPath, document: Document) {
    const root = document.documentElement
    const range = document.createRange()
    let currentNode: Node | null = root

    for (const step of path.steps) {
      currentNode = getNodeByIndex(currentNode as ParentNode, step.index, step.type)
    }

    if (currentNode) {
      range.selectNodeContents(currentNode)
    } else {
      range.selectNodeContents(document.body)
    }

    return range
  }

  static parseBase(fragment: string) {
    const steps = this.parseSteps(fragment)

    return {
      nodeIndex: steps[0].index,
      sectionIndex: steps[1].index,
      sectionId: steps[1].assertion
    }
  }

  static parse(fragment: string) {
    const parts = fragment.slice(8, fragment.length - 1).split('!')

    const base = this.parseBase(parts[0])
    const ranges = parts[1].split(',')

    if (ranges.length === 3) {
      const startPath = this.parsePath(ranges[0] + ranges[1])
      const endPath = this.parsePath(ranges[0] + ranges[2])

      return {
        base,
        path: startPath,
        endPath
      }
    } else {
      const path = this.parsePath(ranges[0])

      return {
        base,
        path
      }
    }
  }

  static generateSteps(node: Node) {
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

  static generatePath(node: Node, offset?: number) {
    const steps = this.generateSteps(node)

    const path: CFIPath = {
      steps,
      offset
    }

    return path
  }

  static pathToString(path: CFIPath) {
    let fragment = path.steps
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

    if (path.offset !== undefined) {
      fragment += `:${path.offset}`
    }

    if (path.assertion) {
      fragment += `[${path.assertion}]`
    }

    return fragment
  }

  static generateBase(nodeIndex: number, sectionIndex: number, sectionId: string) {
    let fragment = `/${(nodeIndex + 1) * 2}/${(sectionIndex + 1) * 2}`

    if (sectionId) {
      fragment += `[${sectionId}]`
    }

    return fragment
  }

  static generate(base: string, range: Range) {
    if (range.collapsed) {
      const path = this.generatePath(
        range.startContainer,
        range.startContainer.nodeType === Node.TEXT_NODE ? range.startOffset : undefined
      )

      const fragments = []

      fragments.push('epubcfi(')
      fragments.push(base)
      fragments.push('!')
      fragments.push(this.pathToString(path))
      fragments.push(')')

      return fragments.join('')
    } else {
      const startPath = this.generatePath(
        range.startContainer,
        range.startContainer.nodeType === Node.TEXT_NODE ? range.startOffset : undefined
      )
      const endPath = this.generatePath(
        range.endContainer,
        range.endContainer.nodeType === Node.TEXT_NODE ? range.endOffset : undefined
      )

      const startFragment = this.pathToString(startPath)
      const endFragment = this.pathToString(endPath)
      let index = 0
      const length = Math.min(startFragment.length, endFragment.length)
      while (index < length) {
        if (startFragment[index] !== endFragment[index]) {
          index -= 1
          break
        } else {
          index += 1
        }
      }

      const fragments = []

      fragments.push('epubcfi(')
      fragments.push(base)
      fragments.push('!')
      fragments.push(startFragment.slice(0, index))
      fragments.push(',')
      fragments.push(startFragment.slice(index))
      fragments.push(',')
      fragments.push(endFragment.slice(index))
      fragments.push(')')

      return fragments.join('')
    }
  }
}
