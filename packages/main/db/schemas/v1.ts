export default {
  version: 1,
  sentences: [
    `CREATE TABLE books (
      md5 TEXT NOT NULL,
      size INTEGER NOT NULL,
      createTime INTEGER NOT NULL,
      path TEXT UNIQUE,
      file BLOB,
      title TEXT,
      cover BLOB,
      creator TEXT,
      description TEXT,
      date TEXT,
      publisher TEXT,
      identifier TEXT UNIQUE,
      location TEXT,
      accessTime INTEGER
    );`
  ]
}
