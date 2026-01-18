'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const phone = formData.get('phone') as string;
  
  if (!phone || phone.length < 9) {
    throw new Error('Số điện thoại không hợp lệ');
  }

  const cookieStore = await cookies();
  // Set cookie for 1 year
  cookieStore.set('user_id', phone, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });

  redirect('/');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
  redirect('/welcome');
}

export async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('user_id')?.value;
}
