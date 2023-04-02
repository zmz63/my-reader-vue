import { type BookMeta, invokeDB } from '.'

export type HighlightData = {
  bookId: BookMeta['rowid']
  section: number
  location: string
  createTime: number
}

const HIGHLIGHT_KEYS = ['bookId', 'section', 'location', 'createTime']

export async function insertHighlight(highlight: HighlightData) {
  const keys = Object.keys(highlight)

  const result = await invokeDB(
    'run',
    `INSERT INTO highlights (${keys.join(', ')}) VALUES (${keys.map(key => `$${key}`).join(', ')})`,
    [highlight]
  )

  return { rowid: result.lastInsertRowid }
}

export function deleteHighlight(id: number | bigint) {
  return invokeDB('run', `DELETE FROM highlights WHERE rowid = ?`, [id])
}

export function getHighlightList(bookId: number | bigint, section?: number) {
  return invokeDB<HighlightData & { rowid: number | bigint }>(
    'all',
    `SELECT rowid, ${HIGHLIGHT_KEYS.join(', ')} FROM highlights (WHERE bookId = ?${
      section !== undefined ? ', section = ?' : ''
    }) ORDER BY rowid DESC`,
    [bookId, section]
  )
}
