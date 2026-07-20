import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { NotificationProvider } from "@/components/modules/v2/notification-center";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-serif-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OracleMind · AI-Powered Destiny Forecast | Ancient Wisdom Meets AI",
  description: "Not fortune-telling. Fore-sight. 5 modern AI agents × 5 ancient Chinese manuscripts cross-validate your destiny. Get probability-based forecasts powered by 1000-year-old Eastern mysticism and cutting-edge AI.",
  keywords: [
    'AI destiny forecast', 'AI prediction', 'fortune telling AI',
    'Chinese astrology', 'Bazi', 'ancient Chinese wisdom',
    'destiny prediction', 'AI oracle', 'life forecast',
    'Eastern mysticism', 'GraphRAG prediction', 'multi-agent AI',
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OracleMind",
  },
  openGraph: {
    title: 'OracleMind · AI-Powered Destiny Forecast',
    description: '5 AI agents × 5 ancient manuscripts. Not fortune-telling — probability-based fore-sight powered by 1000 years of Eastern wisdom.',
    type: 'website',
    locale: 'en_US',
    siteName: 'OracleMind',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OracleMind — AI Destiny Forecast',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OracleMind · AI-Powered Destiny Forecast',
    description: '5 AI agents × 5 ancient manuscripts cross-validate your future. Not fortune-telling. Fore-sight.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://oraclemind.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable} antialiased bg-background text-foreground`}
      >
        {/* 初始 loading skeleton，React 水合后会被替换 */}
        <div id="initial-loader" style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'oklch(0.13 0.005 200)',
          zIndex: 9999,
          transition: 'opacity 0.3s',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 32,
              height: 32,
              border: '2px solid oklch(0.70 0.12 180 / 20%)',
              borderTopColor: 'oklch(0.70 0.12 180)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }} />
            <div style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: 'oklch(0.55 0.015 200)',
              letterSpacing: '0.1em',
            }}>OracleMind LOADING...</div>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster />
          </NotificationProvider>
        </AuthProvider>
        <script dangerouslySetInnerHTML={{ __html: `
          // 兜底机制：无论 hydration 成功与否，3秒后强制隐藏 loader
          // 修复：SW缓存导致hydration失败时loader永远不消失 → 白屏
          function hideLoader() {
            var loader = document.getElementById('initial-loader');
            if (loader) {
              loader.style.opacity = '0';
              setTimeout(function() { 
                if (loader.parentNode) loader.parentNode.removeChild(loader); 
              }, 300);
            }
          }
          // 1. 页面load后100ms尝试隐藏（正常hydration路径）
          window.addEventListener('load', function() {
            setTimeout(hideLoader, 100);
          });
          // 2. 3秒后强制隐藏（hydration失败兜底）
          setTimeout(hideLoader, 3000);
          
          // 3. 5秒后强制显示所有内容（hydration失败时framer-motion的opacity:0不会触发）
          function forceShowContent() {
            document.querySelectorAll('[style*="opacity:0"]').forEach(function(el) {
              el.style.opacity = '1';
              el.style.transform = 'none';
            });
          }
          setTimeout(forceShowContent, 5000);
          // 3. DOMContentLoaded后立即尝试（快速路径）
          if (document.readyState !== 'loading') {
            setTimeout(hideLoader, 100);
          } else {
            document.addEventListener('DOMContentLoaded', function() {
              setTimeout(hideLoader, 100);
            });
          }
        `}} />
      </body>
    </html>
  );
}