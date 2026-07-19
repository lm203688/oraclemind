'use client';

/**
 * 根错误边界 — 捕获客户端hydration错误
 * 显示友好的错误提示而非白屏
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'oklch(0.13 0.005 200)',
        color: 'oklch(0.70 0.12 180)',
        fontFamily: 'system-ui, sans-serif',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>
        Something went wrong
      </h2>
      <p
        style={{
          fontSize: '13px',
          color: 'oklch(0.55 0.015 200)',
          margin: 0,
          maxWidth: '400px',
        }}
      >
        {error.message || 'An unexpected error occurred. Please try reloading.'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '8px 20px',
          fontSize: '13px',
          background: 'oklch(0.70 0.12 180)',
          color: 'oklch(0.13 0.005 200)',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        Try again
      </button>
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
          fontSize: '12px',
          background: 'transparent',
          color: 'oklch(0.55 0.015 200)',
          border: '1px solid oklch(0.30 0.01 200)',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Clear cache & reload
      </button>
    </div>
  );
}
