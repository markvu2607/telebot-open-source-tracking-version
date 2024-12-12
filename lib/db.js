import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./data.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS packages (name TEXT PRIMARY KEY, version TEXT)"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS following (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, package_name TEXT)"
  );
});

export default db;
