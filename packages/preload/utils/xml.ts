/* eslint-disable @typescript-eslint/no-explicit-any */
export function getElementText(node: any, callback?: (item: any, index?: number) => boolean) {
  if (typeof node === 'object') {
    if (Array.isArray(node)) {
      if (callback) {
        for (let i = 0; i < node.length; i++) {
          if (callback(node[i], i)) {
            return (node[i]['#text'] as string) || ''
          }
        }
      } else {
        return (node[0]['#text'] as string) || ''
      }
    } else {
      return (node['#text'] as string) || ''
    }
  }

  return ''
}

export function getElementAttribute(
  node: any,
  attribute: string,
  callback?: (item: any, index?: number) => boolean
) {
  if (typeof node === 'object') {
    if (Array.isArray(node)) {
      if (callback) {
        for (let i = 0; i < node.length; i++) {
          if (callback(node[i], i)) {
            return (node[i][attribute] as string) || ''
          }
        }
      } else {
        return (node[0][attribute] as string) || ''
      }
    } else {
      return (node[attribute] as string) || ''
    }
  }

  return ''
}
