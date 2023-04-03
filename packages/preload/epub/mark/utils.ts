export function coords(element: HTMLElement, container: HTMLElement) {
  const containerRect = container.getBoundingClientRect()
  const rect = element.getBoundingClientRect()

  return new DOMRect(
    rect.x - containerRect.x,
    rect.y - containerRect.y,
    element.scrollWidth,
    element.scrollHeight
  )
}

export function setCoords(element: SVGSVGElement, coords: DOMRect) {
  element.style.setProperty('top', `${coords.top}px`, 'important')
  element.style.setProperty('left', `${coords.left}px`, 'important')
  element.style.setProperty('height', `${coords.height}px`, 'important')
  element.style.setProperty('width', `${coords.width}px`, 'important')
}
