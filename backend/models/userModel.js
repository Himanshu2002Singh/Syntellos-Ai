import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

export const userModel = {
  async findByEmail(email) {
    return db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
  },

  async findById(id) {
    const user = await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return user;
  },

  async create({ name, email, password, role = 'admin' }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, role]
    );
    return { id: result.insertId, name, email, role };
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    return true;
  },

  async count() {
    const row = await db.get('SELECT COUNT(*) as count FROM users');
    return row ? row.count : 0;
  }
};
