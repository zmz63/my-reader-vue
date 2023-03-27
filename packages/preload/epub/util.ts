export function indexOfNode(node: Node, nodeType: number) {
  const parent = node.parentNode as ParentNode
  const children = parent.childNodes

  let i = -1
  for (const child of children) {
    if (child.nodeType === nodeType) {
      i++
      if (child === node) {
        return i
      }
    }
  }

  return i
}

export function getNodeByIndex(parent: ParentNode, index: number, nodeType: number) {
  const children = parent.childNodes

  let i = -1
  for (const child of children) {
    if (child.nodeType === nodeType) {
      i++
      if (i === index) {
        return child
      } else if (i > index) {
        return null
      }
    }
  }

  return null
}

export function replaceBase(document: Document, url: string) {
  let head = document.querySelector('head')

  if (!head) {
    head = document.createElement('head')
    document.documentElement.insertBefore(head, document.documentElement.firstChild)
  }

  let base = head.querySelector('base')

  if (!base) {
    base = document.createElement('base')
    head.insertBefore(base, head.firstChild)
  }

  base.setAttribute('href', url)
}

export function replaceAttribute(
  document: Document,
  tag: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap,
  attribute: string,
  value: string,
  origin?: string
) {
  const elements = document.querySelectorAll(`${tag}[${attribute}${origin ? `="${origin}"` : ''}]`)

  for (const element of elements) {
    element.setAttribute(attribute, value)
  }
}
