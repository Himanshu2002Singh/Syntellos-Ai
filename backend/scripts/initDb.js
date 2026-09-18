import { initDatabase } from '../config/db.js';
import { runSeed } from './seed.js';
import { logger } from '../utils/logger.js';

async function main() {
  try {
    logger.info('Initializing Syntellos AI Database...');
    await initDatabase();
    await runSeed();
    logger.success('Database initialization and seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    logger.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

main();
