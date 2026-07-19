'use client';

/**
 * 全局错误边界 — 捕获 layout 级别的错误
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#5eead4',
          fontFamily: 'system-ui, sans-serif',
          flexDirection: 'column',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
          margin: 0,
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>
          OracleMind — Loading Error
        </h2>
        <p style={{ fontSize: '13px', color: '#888', margin: 0, maxWidth: '400px' }}>
          {error.message || 'Something went wrong. Please try reloading.'}
        </p>
        <button
          onClick={() => {
            if ('caches' in window) {
              caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
            }
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
            }
            window.location.reload();
          }}
          style={{
            padding: '8px 20px',
            fontSize: '13px',
            background: '#5eead4',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Clear cache & reload
        </button>
      </body>
    </html>
  );
}
