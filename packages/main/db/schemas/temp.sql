CREATE TABLE books (
  md5 TEXT NOT NULL,
  size INTEGER NOT NULL,
  createTime INTEGER NOT NULL,
  path TEXT UNIQUE,
  file BLOB,
  title TEXT,
  cover BLOB,
  creator TEXT,
  description TEXT,
  identifier TEXT,
  location TEXT,
  accessTime INTEGER,
);
