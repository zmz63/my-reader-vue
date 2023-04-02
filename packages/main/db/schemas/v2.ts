export default {
  version: 2,
  sentences: [
    `CREATE TABLE IF NOT EXISTS highlights (
      bookId INTEGER NOT NULL,
      section INTEGER NOT NULL,
      location TEXT NOT NULL UNIQUE,
      createTime INTEGER NOT NULL
    );`
  ]
}
