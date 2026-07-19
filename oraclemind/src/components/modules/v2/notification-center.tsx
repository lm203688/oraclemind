'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = 不自动关闭
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextValue {
  notify: (n: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
  notifications: Notification[];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    // 降级：返回空函数，避免在 provider 外调用崩溃
    return {
      notify: () => {},
      dismiss: () => {},
      notifications: [],
    };
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((n: Omit<Notification, 'id'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const notification: Notification = { id, duration: 4000, ...n };
    setNotifications(prev => [...prev, notification]);

    // 自动关闭
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, notification.duration);
    }
  }, [dismiss]);

  // 桌面通知（需要权限）
  const sendDesktopNotification = useCallback((title: string, message?: string) => {
    if (typeof window === 'undefined') return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  }, []);

  // 请求权限（首次时）
  useEffect(() => {
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      // 不主动请求，用户在设置里开启时再请求
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, dismiss, notifications }}>
      {children}
      <NotificationContainer notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// 通知容器（右上角）
// ---------------------------------------------------------------------------

function NotificationContainer({
  notifications,
  onDismiss,
}: {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-14 right-4 z-[60] flex w-80 flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map(n => (
          <NotificationCard key={n.id} notification={n} onDismiss={() => onDismiss(n.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 单条通知卡片
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  success: { icon: CheckCircle2, color: 'oklch(0.70 0.14 145)', bg: 'oklch(0.70 0.14 145 / 8%)', border: 'oklch(0.70 0.14 145 / 25%)' },
  error: { icon: AlertCircle, color: 'oklch(0.65 0.18 25)', bg: 'oklch(0.65 0.18 25 / 8%)', border: 'oklch(0.65 0.18 25 / 25%)' },
  warning: { icon: AlertCircle, color: 'oklch(0.70 0.12 180)', bg: 'oklch(0.70 0.12 180 / 8%)', border: 'oklch(0.70 0.12 180 / 25%)' },
  info: { icon: Info, color: 'oklch(0.70 0.12 180)', bg: 'oklch(0.70 0.12 180 / 8%)', border: 'oklch(0.70 0.12 180 / 25%)' },
};

function NotificationCard({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: () => void;
}) {
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20 }}
      className={cn(
        'pointer-events-auto rounded-lg border p-3 backdrop-blur-md shadow-lg',
      )}
      style={{
        background: `oklch(0.16 0.008 200 / 95%)`,
        borderColor: config.border,
      }}
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0" style={{ color: config.color }} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground">
            {notification.title}
          </div>
          {notification.message && (
            <div className="mt-0.5 text-[11px] leading-relaxed text-[oklch(0.60_0.01_200)]">
              {notification.message}
            </div>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-1.5 text-[10px] font-mono underline"
              style={{ color: config.color }}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 text-[oklch(0.45_0.015_200)] transition-colors hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 通知铃铛按钮（显示未读数）
// ---------------------------------------------------------------------------

export function NotificationBell() {
  const { notifications, dismiss } = useNotifications();
  const [showList, setShowList] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowList(!showList)}
        className="relative flex items-center gap-1 text-[10px] font-mono text-[oklch(0.50_0.015_200)] transition-colors hover:text-[oklch(0.70_0.12_180)]"
      >
        <Bell className="size-3" />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-[oklch(0.65_0.18_25)] text-[8px] font-bold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 top-6 z-50 w-64 rounded-lg border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.13_0.005_200/95%)] p-2 shadow-xl backdrop-blur-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[oklch(0.55_0.015_200)]">通知</span>
              {notifications.length > 0 && (
                <button
                  onClick={() => notifications.forEach(n => dismiss(n.id))}
                  className="text-[9px] text-[oklch(0.45_0.015_200)] hover:text-foreground"
                >
                  全部清除
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="py-4 text-center text-[10px] text-[oklch(0.45_0.015_200)]">暂无通知</p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                {notifications.map(n => {
                  const config = TYPE_CONFIG[n.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={n.id}
                      className="rounded p-1.5 cursor-pointer hover:bg-[oklch(0.20_0.008_200)]"
                      onClick={() => dismiss(n.id)}
                    >
                      <div className="flex items-start gap-1.5">
                        <Icon className="mt-0.5 size-3 shrink-0" style={{ color: config.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-medium text-foreground truncate">{n.title}</div>
                          {n.message && <div className="text-[9px] text-[oklch(0.50_0.015_200)] line-clamp-2">{n.message}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
