export default {
  version: 1,
  sentences: [
    `CREATE TABLE books(
      title TEXT NOT NULL,
      cover BLOB DEFAULT NULL,
      creator TEXT DEFAULT NULL,
      description TEXT DEFAULT NULL,
      identifier TEXT DEFAULT NULL,
      md5 TEXT NOT NULL,
      path TEXT UNIQUE,
      location TEXT DEFAULT NULL,
      file BLOB DEFAULT NULL
    );`
  ]
}
