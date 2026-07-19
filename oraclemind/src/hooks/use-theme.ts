'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'oraclemind-theme';

/**
 * 主题切换 hook
 * 支持 dark / light 两种主题，保存在 localStorage
 * 默认 dark（实验室冷感设计）
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 读取存储的主题
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored);
      }
    } catch {}
    setMounted(true);
  }, []);

  // 应用主题到 document
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme, mounted]);

  const toggle = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, toggle, mounted };
}
