const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dayflow.db');
const db = new Database(dbPath);

function init() {
  // employees
  db.prepare(
    `CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      loginId TEXT UNIQUE,
      password TEXT,
      name TEXT,
      email TEXT,
      role TEXT,
      department TEXT,
      position TEXT,
      avatar TEXT,
      joinDate TEXT,
      phone TEXT,
      address TEXT,
      photo TEXT,
      resume TEXT,
      skills TEXT,
      certifications TEXT,
      salary TEXT,
      privateInfo TEXT
    )`
  ).run();

  // leaves
  db.prepare(
    `CREATE TABLE IF NOT EXISTS leaves (
      id TEXT PRIMARY KEY,
      userId TEXT,
      userName TEXT,
      type TEXT,
      startDate TEXT,
      endDate TEXT,
      reason TEXT,
      status TEXT,
      appliedOn TEXT
    )`
  ).run();

  // attendance
  db.prepare(
    `CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      userId TEXT,
      date TEXT,
      checkIn TEXT,
      checkOut TEXT,
      hoursWorked REAL,
      status TEXT
    )`
  ).run();
}

module.exports = { db, init };
