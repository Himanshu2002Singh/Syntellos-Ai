import crypto from 'crypto';
import { db } from '../config/db.js';

export const subscriberModel = {
  async findByEmail(email) {
    return db.get('SELECT * FROM subscribers WHERE LOWER(email) = LOWER(?)', [email.trim()]);
  },

  async create({ name, email }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const existing = await this.findByEmail(cleanEmail);

    if (existing) {
      if (!existing.is_active) {
        const isMySQL = db.getDriver() === 'mysql';
        await db.run(
          `UPDATE subscribers SET name = ?, is_active = 1, unsubscribed_at = NULL, subscribed_at = ${isMySQL ? 'NOW()' : 'datetime("now")'} WHERE id = ?`,
          [cleanName, existing.id]
        );
        return { ...existing, is_active: 1, reactivated: true };
      }
      return { ...existing, alreadySubscribed: true };
    }

    const token = crypto.randomBytes(24).toString('hex');
    const result = await db.run(
      'INSERT INTO subscribers (name, email, unsubscribe_token, is_active) VALUES (?, ?, ?, 1)',
      [cleanName, cleanEmail, token]
    );

    return {
      id: result.insertId,
      name: cleanName,
      email: cleanEmail,
      unsubscribe_token: token,
      is_active: 1,
      isNew: true
    };
  },

  async unsubscribe({ token, email }) {
    let sql = '';
    let params = [];
    const isMySQL = db.getDriver() === 'mysql';
    const unsubTime = isMySQL ? 'NOW()' : 'datetime("now")';

    if (token) {
      sql = `UPDATE subscribers SET is_active = 0, unsubscribed_at = ${unsubTime} WHERE unsubscribe_token = ?`;
      params = [token];
    } else if (email) {
      sql = `UPDATE subscribers SET is_active = 0, unsubscribed_at = ${unsubTime} WHERE LOWER(email) = LOWER(?)`;
      params = [email.trim()];
    } else {
      return false;
    }

    const result = await db.run(sql, params);
    return result.changes > 0;
  },

  async getAllActive() {
    return db.all('SELECT id, name, email, unsubscribe_token, subscribed_at FROM subscribers WHERE is_active = 1');
  },

  async findAll({ search, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM subscribers WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      sql += ' AND (email LIKE ? OR name LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ' ORDER BY subscribed_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const subscribers = await db.all(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM subscribers WHERE 1=1';
    const countParams = [];
    if (search && search.trim()) {
      countSql += ' AND (email LIKE ? OR name LIKE ?)';
      countParams.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const countRow = await db.get(countSql, countParams);

    return {
      subscribers,
      total: countRow ? countRow.total : 0,
      limit: Number(limit),
      offset: Number(offset)
    };
  },

  async delete(id) {
    const result = await db.run('DELETE FROM subscribers WHERE id = ?', [id]);
    return result.changes > 0;
  },

  async getStats() {
    const totalRow = await db.get('SELECT COUNT(*) as total FROM subscribers');
    const activeRow = await db.get('SELECT COUNT(*) as active FROM subscribers WHERE is_active = 1');
    const unsubRow = await db.get('SELECT COUNT(*) as unsubscribed FROM subscribers WHERE is_active = 0');

    return {
      total: totalRow ? totalRow.total : 0,
      active: activeRow ? activeRow.active : 0,
      unsubscribed: unsubRow ? unsubRow.unsubscribed : 0
    };
  }
};
