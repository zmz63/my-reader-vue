import { type BookMeta, invokeDB } from '.'

export type BookmarkData = {
  id: number | bigint
  bookId: BookMeta['id']
  section: number
  fragment: string
  location: string
  createTime: number
}

export async function insertBookmark(bookmark: Omit<BookmarkData, 'id'>) {
  const keys = Object.keys(bookmark)

  const result = await invokeDB(
    'run',
    `INSERT INTO bookmarks (${keys.join(', ')}) VALUES (${keys.map(key => `$${key}`).join(', ')})`,
    [bookmark]
  )

  return { id: result.lastInsertRowid }
}

export function deleteBookmark(id: number | bigint) {
  return invokeDB('run', `DELETE FROM bookmarks WHERE id = ?`, [id])
}

export function getBookmarkList(bookId: number | bigint, section?: number) {
  if (section !== undefined) {
    return invokeDB<BookmarkData>(
      'all',
      'SELECT * FROM bookmarks WHERE bookId = ? AND section = ? ORDER BY id DESC',
      [bookId, section]
    )
  } else {
    return invokeDB<BookmarkData>(
      'all',
      'SELECT * FROM bookmarks WHERE bookId = ? ORDER BY id DESC',
      [bookId]
    )
  }
}
