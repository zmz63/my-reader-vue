export default {
  version: 2,
  sentences: [
    `CREATE TABLE IF NOT EXISTS highlights (
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
