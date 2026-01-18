const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const url = process.env.TURSO_URL || 'file:food.db';
const authToken = process.env.TURSO_TOKEN;

console.log('Migrating database (remove image) at:', url);

const db = createClient({
  url,
  authToken,
});

async function migrate() {
  try {
    console.log('🔄 Starting migration to remove image column...');

    // 1. Create new table without image column
    console.log('Creating new table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS foods_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL DEFAULT 'default',
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        price INTEGER,
        tags TEXT
      )
    `);

    // 2. Copy data
    console.log('Copying data...');
    // We explicitly select columns to map them correctly, skipping 'image'
    await db.execute(`
      INSERT INTO foods_new (id, user_id, name, type, price, tags)
      SELECT id, user_id, name, type, price, tags FROM foods
    `);

    // 3. Drop old table
    console.log('Dropping old table...');
    await db.execute('DROP TABLE foods');

    // 4. Rename new table
    console.log('Renaming table...');
    await db.execute('ALTER TABLE foods_new RENAME TO foods');

    console.log('✅ Migration complete! Image column removed.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrate();
