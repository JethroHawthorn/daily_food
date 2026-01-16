import { createClient } from '@libsql/client';

const url = process.env.TURSO_URL || 'file:food.db';
const authToken = process.env.TURSO_TOKEN;

const db = createClient({
  url,
  authToken,
});

export default db;
