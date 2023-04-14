export default {
  version: 3,
  sentences: [
    `CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER,
      bookId INTEGER NOT NULL,
      section INTEGER NOT NULL,
      fragment TEXT NOT NULL,
      location TEXT NOT NULL UNIQUE,
      createTime INTEGER NOT NULL,
      PRIMARY KEY (id),

      FOREIGN KEY (bookId) REFERENCES books (id) ON DELETE CASCADE ON UPDATE CASCADE
    );`
  ]
}
