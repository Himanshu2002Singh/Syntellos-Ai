import { db } from '../config/db.js';

export const leadModel = {
  async create({ name, email, phone = '', organization = '', city = '', intent, message }) {
    const result = await db.run(
      `INSERT INTO leads (name, email, phone, organization, city, intent, message, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        (phone || '').trim(),
        (organization || '').trim(),
        (city || '').trim(),
        intent.trim(),
        message.trim()
      ]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    return db.get('SELECT * FROM leads WHERE id = ?', [id]);
  },

  async findAll({ intent, status, search, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (intent && intent !== 'all') {
      sql += ' AND intent = ?';
      params.push(intent);
    }

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      sql += ' AND (name LIKE ? OR email LIKE ? OR organization LIKE ? OR city LIKE ? OR message LIKE ?)';
      params.push(s, s, s, s, s);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const leads = await db.all(sql, params);
    
    let countSql = 'SELECT COUNT(*) as total FROM leads WHERE 1=1';
    const countParams = [];
    if (intent && intent !== 'all') {
      countSql += ' AND intent = ?';
      countParams.push(intent);
    }
    if (status && status !== 'all') {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      countSql += ' AND (name LIKE ? OR email LIKE ? OR organization LIKE ? OR city LIKE ? OR message LIKE ?)';
      countParams.push(s, s, s, s, s);
    }

    const countRow = await db.get(countSql, countParams);
    return {
      leads,
      total: countRow ? countRow.total : 0,
      limit: Number(limit),
      offset: Number(offset)
    };
  },

  async exportAll() {
    return db.all('SELECT id, name, email, phone, organization, city, intent, message, status, notes, created_at FROM leads ORDER BY created_at DESC');
  },

  async updateStatus(id, { status, notes }) {
    let sql = 'UPDATE leads SET ';
    const params = [];
    const updates = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) return this.findById(id);

    const isMySQL = db.getDriver() === 'mysql';
    updates.push(isMySQL ? 'updated_at = NOW()' : 'updated_at = datetime("now")');

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await db.run(sql, params);
    return this.findById(id);
  },

  async delete(id) {
    const result = await db.run('DELETE FROM leads WHERE id = ?', [id]);
    return result.changes > 0;
  },

  async getStats() {
    const totalRow = await db.get('SELECT COUNT(*) as total FROM leads');
    const newRow = await db.get("SELECT COUNT(*) as new_leads FROM leads WHERE status = 'new'");
    const byIntent = await db.all('SELECT intent, COUNT(*) as count FROM leads GROUP BY intent');
    const byStatus = await db.all('SELECT status, COUNT(*) as count FROM leads GROUP BY status');

    return {
      total: totalRow ? totalRow.total : 0,
      newLeads: newRow ? newRow.new_leads : 0,
      byIntent,
      byStatus
    };
  }
};
