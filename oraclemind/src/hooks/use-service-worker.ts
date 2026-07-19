'use client';

import { useEffect } from 'react';

/**
 * Service Worker 清理 hook
 * 2026-07-20: 禁用SW注册并自动卸载旧SW——cache-first策略导致hydration失败白屏
 */
export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const cleanup = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
          console.log('[SW] Unregistered old service worker');
        }
        // 清除所有缓存
        if ('caches' in window) {
          const keys = await caches.keys();
          for (const key of keys) {
            await caches.delete(key);
          }
          console.log('[SW] Cleared all caches');
        }
      } catch (err) {
        console.error('[SW] Cleanup failed:', err);
      }
    };

    cleanup();
  }, []);
}
