/**
 * OracleMind Service Worker — SELF-UNINSTALL
 * 2026-07-20: cache-first策略导致hydration失败白屏，永久禁用SW
 * 此文件的作用：让已安装的旧SW自动卸载，不再拦截任何请求
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 清除所有缓存
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      // 注销自己
      await self.registration.unregister();
      // 通知所有客户端重新加载
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});

// 不拦截任何请求——直接透传
self.addEventListener('fetch', (event) => {
  return;
});
