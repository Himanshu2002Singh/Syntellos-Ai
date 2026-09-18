import { db } from '../config/db.js';

export const blogModel = {
  async create({
    title,
    slug,
    category,
    excerpt = '',
    content,
    featured_image = '',
    featured_video = '',
    author = 'Syntellos AI Editorial',
    read_time = '5 min read',
    tags = '',
    is_published = false,
  }) {
    const isMySQL = db.getDriver() === 'mysql';
    const pubDate = is_published ? (isMySQL ? 'NOW()' : 'datetime("now")') : 'NULL';

    const result = await db.run(
      `INSERT INTO blogs (
        title, slug, category, excerpt, content, featured_image, featured_video, 
        author, read_time, tags, views, is_published, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ${pubDate})`,
      [
        title.trim(),
        slug.trim().toLowerCase(),
        category.trim(),
        (excerpt || '').trim(),
        content.trim(),
        (featured_image || '').trim(),
        (featured_video || '').trim(),
        (author || 'Syntellos AI Editorial').trim(),
        (read_time || '5 min read').trim(),
        (tags || '').trim(),
        is_published ? 1 : 0
      ]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    return db.get('SELECT * FROM blogs WHERE id = ?', [id]);
  },

  async findBySlug(slug) {
    return db.get('SELECT * FROM blogs WHERE LOWER(slug) = LOWER(?)', [slug.trim()]);
  },

  async findAll({
    category,
    search,
    is_published,
    limit = 20,
    offset = 0,
    sortBy = 'published_at',
    sortOrder = 'DESC'
  } = {}) {
    let sql = 'SELECT id, title, slug, category, excerpt, featured_image, featured_video, author, read_time, tags, views, is_published, published_at, created_at, updated_at FROM blogs WHERE 1=1';
    const params = [];

    if (is_published !== undefined && is_published !== null && is_published !== 'all') {
      sql += ' AND is_published = ?';
      params.push(is_published === true || is_published === 1 || is_published === '1' ? 1 : 0);
    }

    if (category && category !== 'all') {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(category.trim());
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      sql += ' AND (title LIKE ? OR excerpt LIKE ? OR tags LIKE ? OR content LIKE ?)';
      params.push(s, s, s, s);
    }

    const orderField = ['published_at', 'created_at', 'views', 'title'].includes(sortBy) ? sortBy : 'created_at';
    const orderDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${orderField} ${orderDir} LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const blogs = await db.all(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM blogs WHERE 1=1';
    const countParams = [];

    if (is_published !== undefined && is_published !== null && is_published !== 'all') {
      countSql += ' AND is_published = ?';
      countParams.push(is_published === true || is_published === 1 || is_published === '1' ? 1 : 0);
    }
    if (category && category !== 'all') {
      countSql += ' AND LOWER(category) = LOWER(?)';
      countParams.push(category.trim());
    }
    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      countSql += ' AND (title LIKE ? OR excerpt LIKE ? OR tags LIKE ? OR content LIKE ?)';
      countParams.push(s, s, s, s);
    }

    const countRow = await db.get(countSql, countParams);

    return {
      blogs,
      total: countRow ? countRow.total : 0,
      limit: Number(limit),
      offset: Number(offset)
    };
  },

  async update(id, fields = {}) {
    const allowed = [
      'title', 'slug', 'category', 'excerpt', 'content',
      'featured_image', 'featured_video', 'author', 'read_time',
      'tags', 'is_published'
    ];

    const updates = [];
    const params = [];
    const isMySQL = db.getDriver() === 'mysql';

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        if (key === 'is_published') {
          const val = fields[key] ? 1 : 0;
          updates.push('is_published = ?');
          params.push(val);

          if (val === 1) {
            updates.push(`published_at = COALESCE(published_at, ${isMySQL ? 'NOW()' : 'datetime("now")'})`);
          }
        } else {
          updates.push(`${key} = ?`);
          params.push(typeof fields[key] === 'string' ? fields[key].trim() : fields[key]);
        }
      }
    }

    if (updates.length === 0) return this.findById(id);

    updates.push(`updated_at = ${isMySQL ? 'NOW()' : 'datetime("now")'}`);
    const sql = `UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await db.run(sql, params);
    return this.findById(id);
  },

  async togglePublish(id, is_published) {
    const isMySQL = db.getDriver() === 'mysql';
    const val = is_published ? 1 : 0;
    const pubDate = val === 1 ? (isMySQL ? 'NOW()' : 'datetime("now")') : 'NULL';
    const updated = isMySQL ? 'NOW()' : 'datetime("now")';

    await db.run(
      `UPDATE blogs SET is_published = ?, published_at = ${pubDate}, updated_at = ${updated} WHERE id = ?`,
      [val, id]
    );

    return this.findById(id);
  },

  async delete(id) {
    const result = await db.run('DELETE FROM blogs WHERE id = ?', [id]);
    return result.changes > 0;
  },

  async incrementViews(slug) {
    await db.run('UPDATE blogs SET views = views + 1 WHERE LOWER(slug) = LOWER(?)', [slug.trim()]);
  },

  async getCategories() {
    return db.all(`
      SELECT category, COUNT(*) as count 
      FROM blogs 
      WHERE is_published = 1 
      GROUP BY category 
      ORDER BY count DESC
    `);
  },

  async getStats() {
    const totalRow = await db.get('SELECT COUNT(*) as total FROM blogs');
    const publishedRow = await db.get('SELECT COUNT(*) as published FROM blogs WHERE is_published = 1');
    const draftRow = await db.get('SELECT COUNT(*) as drafts FROM blogs WHERE is_published = 0');
    const viewsRow = await db.get('SELECT SUM(views) as total_views FROM blogs');

    return {
      total: totalRow ? totalRow.total : 0,
      published: publishedRow ? publishedRow.published : 0,
      drafts: draftRow ? draftRow.drafts : 0,
      totalViews: viewsRow && viewsRow.total_views ? viewsRow.total_views : 0
    };
  }
};
