'use client';

import { useOfflineData } from '@/hooks/use-offline-data';

export function OfflineSync() {
  useOfflineData();
  return null;
}
