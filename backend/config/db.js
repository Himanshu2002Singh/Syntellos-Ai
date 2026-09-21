import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let activeDriver = 'sqlite';
let mysqlPool = null;
let sqliteDb = null;

// Ensure data folder exists for SQLite
const sqlitePath = path.resolve(process.cwd(), env.SQLITE_FILE);
const sqliteDir = path.dirname(sqlitePath);
if (!fs.existsSync(sqliteDir)) {
  fs.mkdirSync(sqliteDir, { recursive: true });
}

export async function initDatabase() {
  if (env.DB_TYPE === 'mysql') {
    try {
      logger.info(`Attempting connection to MySQL server at ${env.DB_HOST}:${env.DB_PORT}...`);
      
      const tempConnection = await mysql.createConnection({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
      });
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\`;`);
      await tempConnection.end();

      mysqlPool = mysql.createPool({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      const [rows] = await mysqlPool.query('SELECT 1 as val');
      activeDriver = 'mysql';
      logger.success(`Connected successfully to MySQL database: ${env.DB_NAME}`);
    } catch (err) {
      logger.warn(`MySQL connection failed (${err.message}). Falling back gracefully to SQLite (${sqlitePath}) for seamless local development.`);
      activeDriver = 'sqlite';
      await setupSqlite();
    }
  } else {
    activeDriver = 'sqlite';
    await setupSqlite();
  }

  // Create tables
  await createTables();
  return activeDriver;
}

function setupSqlite() {
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(sqlitePath, (err) => {
      if (err) {
        logger.error('Failed to open SQLite database:', err.message);
        reject(err);
      } else {
        logger.success(`SQLite database active at ${sqlitePath}`);
        sqliteDb.run('PRAGMA foreign_keys = ON;', () => resolve(sqliteDb));
      }
    });
  });
}

// Database query abstraction
export const db = {
  getDriver: () => activeDriver,

  async all(sql, params = []) {
    if (activeDriver === 'mysql') {
      const [rows] = await mysqlPool.execute(sql, params);
      return rows;
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    }
  },

  async get(sql, params = []) {
    if (activeDriver === 'mysql') {
      const [rows] = await mysqlPool.execute(sql, params);
      return rows[0] || null;
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    }
  },

  async run(sql, params = []) {
    if (activeDriver === 'mysql') {
      const [result] = await mysqlPool.execute(sql, params);
      return {
        insertId: result.insertId,
        changes: result.affectedRows,
      };
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function (err) {
          if (err) reject(err);
          else {
            resolve({
              insertId: this.lastID,
              changes: this.changes,
            });
          }
        });
      });
    }
  },

  async execute(sql, params = []) {
    return this.run(sql, params);
  }
};

async function createTables() {
  const isMySQL = activeDriver === 'mysql';

  const autoInc = isMySQL ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const textType = isMySQL ? 'LONGTEXT' : 'TEXT';
  const boolType = isMySQL ? 'TINYINT(1) DEFAULT 0' : 'INTEGER DEFAULT 0';
  const dateTimeNow = isMySQL ? 'DATETIME DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP';

  // Users table
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id ${autoInc},
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at ${dateTimeNow},
      updated_at ${dateTimeNow}
    );
  `);

  // Leads table
  await db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id ${autoInc},
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      organization VARCHAR(255),
      city VARCHAR(100),
      intent VARCHAR(100) NOT NULL,
      message ${textType} NOT NULL,
      status VARCHAR(50) DEFAULT 'new',
      notes ${textType},
      created_at ${dateTimeNow},
      updated_at ${dateTimeNow}
    );
  `);

  // Subscribers table
  await db.run(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id ${autoInc},
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE NOT NULL,
      unsubscribe_token VARCHAR(255),
      is_active ${isMySQL ? 'TINYINT(1) DEFAULT 1' : 'INTEGER DEFAULT 1'},
      subscribed_at ${dateTimeNow},
      unsubscribed_at DATETIME
    );
  `);

  // Lightweight migration for databases created before subscriber names were collected.
  if (!isMySQL) {
    const columns = await db.all('PRAGMA table_info(subscribers)');
    if (!columns.some((column) => column.name === 'name')) {
      await db.run('ALTER TABLE subscribers ADD COLUMN name VARCHAR(255)');
    }
  } else {
    const columns = await db.all(`
      SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'subscribers'
    `, [env.DB_NAME]);
    if (!columns.some((column) => column.name === 'name')) {
      await db.run('ALTER TABLE subscribers ADD COLUMN name VARCHAR(255)');
    }
  }

  // Blogs table
  await db.run(`
    CREATE TABLE IF NOT EXISTS blogs (
      id ${autoInc},
      title VARCHAR(500) NOT NULL,
      slug VARCHAR(500) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL,
      excerpt ${textType},
      content ${textType} NOT NULL,
      featured_image VARCHAR(500),
      featured_video VARCHAR(500),
      author VARCHAR(255) DEFAULT 'Syntellos AI Editorial',
      read_time VARCHAR(50) DEFAULT '5 min read',
      tags VARCHAR(500),
      views INTEGER DEFAULT 0,
      is_published ${boolType},
      published_at DATETIME,
      created_at ${dateTimeNow},
      updated_at ${dateTimeNow}
    );
  `);

  // Email logs table
  await db.run(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id ${autoInc},
      type VARCHAR(50) NOT NULL,
      recipient VARCHAR(255) NOT NULL,
      subject VARCHAR(500) NOT NULL,
      status VARCHAR(50) NOT NULL,
      error_message ${textType},
      sent_at ${dateTimeNow}
    );
  `);

  logger.info('Database schema tables verified and ready.');
}
