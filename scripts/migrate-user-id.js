const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const url = process.env.TURSO_URL || 'file:food.db';
const authToken = process.env.TURSO_TOKEN;

console.log('Migrating database at:', url);

const db = createClient({
  url,
  authToken,
});

async function migrate() {
  try {
    // Add user_id to foods
    console.log('Migrating foods table...');
    try {
        await db.execute("ALTER TABLE foods ADD COLUMN user_id TEXT NOT NULL DEFAULT 'default'");
        console.log('✅ Added user_id to foods');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
             console.log('ℹ️ user_id already exists in foods');
        } else {
             console.error('❌ Failed to modifty foods:', e);
        }
    }

    // Add user_id to meal_history
    console.log('Migrating meal_history table...');
     try {
        await db.execute("ALTER TABLE meal_history ADD COLUMN user_id TEXT NOT NULL DEFAULT 'default'");
        console.log('✅ Added user_id to meal_history');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
             console.log('ℹ️ user_id already exists in meal_history');
        } else {
             console.error('❌ Failed to modifty meal_history:', e);
        }
    }

    // daily_checkins is tricky because of PRIMARY KEY change.
    // SQLite doesn't support generic ALTER TABLE DROP PRIMARY KEY.
    // We need to recreate the table.
    console.log('Migrating daily_checkins table...');
    
    // Check if user_id exists
    let checkinColumns = [];
    try {
        const info = await db.execute("PRAGMA table_info(daily_checkins)");
        checkinColumns = info.rows.map(r => r.name);
    } catch(e) {
        console.log('Table daily_checkins might not exist');
    }

    if (checkinColumns.includes('user_id')) {
        console.log('ℹ️ daily_checkins already has user_id (assuming valid)');
    } else {
         console.log('♻️ Recreating daily_checkins table to update Primary Key...');
         await db.execute("ALTER TABLE daily_checkins RENAME TO daily_checkins_old");
         await db.execute(`
            CREATE TABLE IF NOT EXISTS daily_checkins (
              date TEXT,
              user_id TEXT NOT NULL DEFAULT 'default',
              status TEXT NOT NULL CHECK (status IN ('FOLLOWED', 'NOT_FOLLOWED')),
              PRIMARY KEY (date, user_id)
            )
         `);
         await db.execute(`
            INSERT INTO daily_checkins (date, status, user_id)
            SELECT date, status, 'default' FROM daily_checkins_old
         `);
         await db.execute("DROP TABLE daily_checkins_old");
         console.log('✅ Migrated daily_checkins');
    }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
