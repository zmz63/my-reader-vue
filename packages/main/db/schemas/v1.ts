export default {
  version: 1,
  sentences: [
    `CREATE TABLE IF NOT EXISTS books (
      id INTEGER,
      md5 TEXT NOT NULL,
      size INTEGER NOT NULL,
      createTime INTEGER NOT NULL,

      file BLOB,
      path TEXT UNIQUE,
      location TEXT,
      percentage INTEGER,
      accessTime INTEGER,
      readingTime INTEGER,

      title TEXT,
      cover BLOB,
      creator TEXT,
      description TEXT,
      date TEXT,
      publisher TEXT,
      identifier TEXT UNIQUE,

      PRIMARY KEY (id)
    );`
  ]
}
