'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getUserId } from '@/actions/auth';

export async function getCheckIn(date: string) {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const result = await db.execute({
      sql: 'SELECT status FROM daily_checkins WHERE date = ? AND user_id = ?',
      args: [date, userId]
    });
    
    if (result.rows.length > 0) {
      return result.rows[0].status as 'FOLLOWED' | 'NOT_FOLLOWED';
    }
    return null;
  } catch (error) {
    console.error('Error fetching check-in:', error);
    return null;
  }
}

export async function saveCheckIn(date: string, status: 'FOLLOWED' | 'NOT_FOLLOWED') {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('Unauthorized');

    await db.execute({
      sql: `INSERT INTO daily_checkins (date, status, user_id) VALUES (?, ?, ?) 
            ON CONFLICT(date, user_id) DO UPDATE SET status = ?`,
      args: [date, status, userId, status]
    });
    revalidatePath('/');
    return true;
  } catch (error) {
    console.error('Error saving check-in:', error);
    return false;
  }
}
