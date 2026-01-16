import { useEffect } from 'react';
import { getAllFoods, getMealHistory } from '@/actions/offline-sync'; // We need a server action to fetch data for sync

export function useOfflineData() {
  useEffect(() => {
    async function syncData() {
      if (typeof window === 'undefined' || !navigator.onLine) return;

      try {
        const foods = await getAllFoods();
        const history = await getMealHistory();
        
        localStorage.setItem('foods_cache', JSON.stringify(foods));
        localStorage.setItem('history_cache', JSON.stringify(history));
        localStorage.setItem('last_sync', new Date().toISOString());
        console.log('Offline data synced successfully');
      } catch (e) {
        console.error('Failed to sync offline data', e);
      }
    }

    syncData();
    // Sync every 5 minutes if app is open
    const interval = setInterval(syncData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
}

export function getOfflineFoods() {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('foods_cache');
  return stored ? JSON.parse(stored) : [];
}

export function getOfflineHistory() {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('history_cache');
  return stored ? JSON.parse(stored) : [];
}
