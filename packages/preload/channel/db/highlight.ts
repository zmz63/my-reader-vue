import { type BookMeta, invokeDB } from '.'

export type HighlightData = {
  id: number | bigint
  bookId: BookMeta['id']
  section: number
  location: string
  createTime: number
}

export async function insertHighlight(highlight: Omit<HighlightData, 'id'>) {
  const keys = Object.keys(highlight)

  const result = await invokeDB(
    'run',
    `INSERT INTO highlights (${keys.join(', ')}) VALUES (${keys.map(key => `$${key}`).join(', ')})`,
    [highlight]
  )

  return { id: result.lastInsertRowid }
}

export function deleteHighlight(id: number | bigint) {
  return invokeDB('run', `DELETE FROM highlights WHERE id = ?`, [id])
}

export function getHighlightList(bookId: number | bigint, section?: number) {
  return invokeDB<HighlightData>(
    'all',
    `SELECT * FROM highlights WHERE bookId = ?${
      section !== undefined ? ' AND section = ?' : ''
    } ORDER BY id DESC`,
    [bookId, section]
  )
}
