export function replaceBase(document: Document, url: string) {
  const head = document.querySelector('head')

  if (!head) {
    return
  }

  let base = head.querySelector('base')

  if (!base) {
    base = document.createElement('base')
    head.insertBefore(base, head.firstChild)
  }

  base.setAttribute('href', url)
}

export function calculateBorder(element: Element) {
  const style = window.getComputedStyle(element)
  const widthProps = [
    'paddingRight',
    'paddingLeft',
    'marginRight',
    'marginLeft',
    'borderRightWidth',
    'borderLeftWidth'
  ]
  const heightProps = [
    'paddingTop',
    'paddingBottom',
    'marginTop',
    'marginBottom',
    'borderTopWidth',
    'borderBottomWidth'
  ]

  let width = 0
  let height = 0

  for (const prop of widthProps as (keyof CSSStyleDeclaration)[]) {
    width += parseFloat(style[prop] as string) || 0
  }

  for (const prop of heightProps as (keyof CSSStyleDeclaration)[]) {
    height += parseFloat(style[prop] as string) || 0
  }

  return {
    height,
    width
  }
}
