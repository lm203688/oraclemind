'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Settings,
  X,
  Save,
  RotateCcw,
  Clock,
  Languages,
  Cpu,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// 设置类型
// ---------------------------------------------------------------------------

export interface UserSettings {
  /** 默认推演轮次（个人推演） */
  personalRounds: number;
  /** 默认推演轮次（事件推演） */
  eventRounds: number;
  /** 语言偏好 */
  language: 'zh' | 'en';
  /** 是否启用通知 */
  notificationsEnabled: boolean;
  /** 是否自动滚动到最新输出 */
  autoScroll: boolean;
  /** Agent 输出是否默认展开 */
  defaultExpandAgents: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  personalRounds: 8,
  eventRounds: 15,
  language: 'zh',
  notificationsEnabled: true,
  autoScroll: true,
  defaultExpandAgents: false,
};

const STORAGE_KEY = 'oraclemind-settings';

// ---------------------------------------------------------------------------
// Hook：读取/保存设置
// ---------------------------------------------------------------------------

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {}
    setLoaded(true);
  }, []);

  const update = (partial: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {}
  };

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return { settings, update, reset, loaded };
}

// ---------------------------------------------------------------------------
// 设置面板组件
// ---------------------------------------------------------------------------

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: UserSettings;
  onUpdate: (partial: Partial<UserSettings>) => void;
  onReset: () => void;
}

export function SettingsPanel({ open, onOpenChange, settings, onUpdate, onReset }: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.13_0.005_200)] p-5 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="size-4 text-[oklch(0.70_0.12_180)]" />
                <span className="text-sm font-semibold text-foreground">偏好设置</span>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="text-[oklch(0.45_0.015_200)] transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 推演轮次设置 */}
              <div className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <Clock className="size-3 text-[oklch(0.70_0.12_180)]" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[oklch(0.55_0.015_200)]">
                    默认推演轮次
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] text-[oklch(0.65_0.01_200)]">个人推演</span>
                      <span className="font-mono-tabular text-xs font-bold text-[oklch(0.70_0.12_180)]">
                        {settings.personalRounds} 轮
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={12}
                      value={settings.personalRounds}
                      onChange={(e) => onUpdate({ personalRounds: parseInt(e.target.value) })}
                      className="w-full accent-[oklch(0.70_0.12_180)]"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[oklch(0.40_0.015_200)]">
                      <span>3（快速）</span>
                      <span>12（深度）</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] text-[oklch(0.65_0.01_200)]">事件推演</span>
                      <span className="font-mono-tabular text-xs font-bold text-[oklch(0.70_0.12_180)]">
                        {settings.eventRounds} 轮
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={20}
                      value={settings.eventRounds}
                      onChange={(e) => onUpdate({ eventRounds: parseInt(e.target.value) })}
                      className="w-full accent-[oklch(0.70_0.12_180)]"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[oklch(0.40_0.015_200)]">
                      <span>5（快速）</span>
                      <span>20（深度）</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 显示设置 */}
              <div className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <Cpu className="size-3 text-[oklch(0.70_0.12_180)]" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[oklch(0.55_0.015_200)]">
                    显示选项
                  </span>
                </div>
                <div className="space-y-2">
                  <ToggleItem
                    label="自动滚动到最新输出"
                    description="流式推演时自动滚动"
                    value={settings.autoScroll}
                    onChange={(v) => onUpdate({ autoScroll: v })}
                  />
                  <ToggleItem
                    label="默认展开Agent输出"
                    description="Agent卡片默认展开显示全文"
                    value={settings.defaultExpandAgents}
                    onChange={(v) => onUpdate({ defaultExpandAgents: v })}
                  />
                </div>
              </div>

              {/* 通知设置 */}
              <div className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <Bell className="size-3 text-[oklch(0.70_0.12_180)]" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[oklch(0.55_0.015_200)]">
                    通知
                  </span>
                </div>
                <ToggleItem
                  label="推演完成通知"
                  description="推演完成时显示桌面通知"
                  value={settings.notificationsEnabled}
                  onChange={(v) => onUpdate({ notificationsEnabled: v })}
                />
              </div>

              {/* 语言设置（占位，暂只支持中文） */}
              <div className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] p-3 opacity-50">
                <div className="mb-2 flex items-center gap-1.5">
                  <Languages className="size-3 text-[oklch(0.70_0.12_180)]" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[oklch(0.55_0.015_200)]">
                    语言
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 rounded border border-[oklch(0.70_0.12_180)] bg-[oklch(0.70_0.12_180/10%)] py-1.5 text-[11px] text-[oklch(0.70_0.12_180)]">
                    中文
                  </button>
                  <button disabled className="flex-1 rounded border border-[oklch(0.70_0.12_180/15%)] py-1.5 text-[11px] text-[oklch(0.45_0.015_200)]">
                    English（即将）
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[oklch(0.70_0.12_180/10%)] pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-7 gap-1 text-[11px] text-[oklch(0.50_0.015_200)]"
              >
                <RotateCcw className="size-3" />
                恢复默认
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-7 gap-1 bg-[oklch(0.70_0.12_180)] text-[11px] text-[oklch(0.13_0.005_200)] hover:bg-[oklch(0.75_0.14_180)]"
              >
                <Save className="size-3" />
                完成
              </Button>
            </div>

            <p className="mt-2 text-center text-[9px] text-[oklch(0.40_0.015_200)]">
              设置保存在本地浏览器（localStorage）
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Toggle 子组件
// ---------------------------------------------------------------------------

function ToggleItem({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[11px] text-[oklch(0.75_0.01_200)]">{label}</div>
        <div className="text-[9px] text-[oklch(0.45_0.015_200)]">{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          value ? 'bg-[oklch(0.70_0.12_180)]' : 'bg-[oklch(0.25_0.008_200)]'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-white transition-transform',
            value ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}
