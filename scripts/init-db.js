const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.TURSO_URL || 'file:food.db';
const authToken = process.env.TURSO_TOKEN;

const db = createClient({
  url,
  authToken,
});

const schemaPath = path.join(__dirname, '../db/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

async function init() {
  try {
    // Split schema by semicolon to execute one by one if needed, 
    // but execute() usually takes one statement. 
    // better-sqlite3 exec() took whole script.
    // @libsql/client executeMultiple() is available.
    
    await db.executeMultiple(schema);
    
    console.log('Database initialized successfully using ' + (url.startsWith('file:') ? 'Local SQLite' : 'Turso'));
  } catch (e) {
    console.error('Error initializing database:', e);
    process.exit(1);
  }
}

init();
