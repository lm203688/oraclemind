'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Activity,
  Network,
  History,
  BarChart3,
  Settings,
  Sun,
  Moon,
  CornerDownLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// 命令项类型
// ---------------------------------------------------------------------------

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  group: 'navigate' | 'action' | 'example';
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (view: string) => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onStartPersonal: () => void;
  onStartEvent: () => void;
}

// ---------------------------------------------------------------------------
// 主组件
// ---------------------------------------------------------------------------

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onToggleTheme,
  onOpenSettings,
  onStartPersonal,
  onStartEvent,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 构建命令列表
  const commands: CommandItem[] = [
    // 导航
    {
      id: 'nav-landing',
      label: '返回首页',
      description: '回到 OracleMind 首页',
      icon: <Activity className="size-4 text-[oklch(0.70_0.12_180)]" />,
      action: () => { onNavigate('landing'); onOpenChange(false); },
      keywords: ['home', '首页', 'landing'],
      group: 'navigate',
    },
    {
      id: 'nav-personal',
      label: '个人生活推演',
      description: '输入个人决策困惑，5现代+5古籍推演',
      icon: <Activity className="size-4 text-[oklch(0.70_0.12_180)]" />,
      action: () => { onStartPersonal(); onOpenChange(false); },
      keywords: ['personal', '个人', '生活', '决策'],
      group: 'navigate',
    },
    {
      id: 'nav-event',
      label: '事件态势推演',
      description: '推演外部事件的态势演化',
      icon: <Network className="size-4 text-[oklch(0.65_0.10_50)]" />,
      action: () => { onStartEvent(); onOpenChange(false); },
      keywords: ['event', '事件', '态势'],
      group: 'navigate',
    },
    {
      id: 'nav-history',
      label: '历史推演',
      description: '查看所有历史推演记录',
      icon: <History className="size-4 text-[oklch(0.70_0.12_180)]" />,
      action: () => { onNavigate('history'); onOpenChange(false); },
      keywords: ['history', '历史', '记录'],
      group: 'navigate',
    },
    {
      id: 'nav-accuracy',
      label: '准确率统计',
      description: '查看系统准确率面板和趋势图',
      icon: <BarChart3 className="size-4 text-[oklch(0.70_0.14_145)]" />,
      action: () => { onNavigate('accuracy'); onOpenChange(false); },
      keywords: ['accuracy', '准确率', '统计', 'trend'],
      group: 'navigate',
    },
    // 操作
    {
      id: 'action-settings',
      label: '打开设置',
      description: '偏好设置（轮次/通知/显示）',
      icon: <Settings className="size-4 text-[oklch(0.70_0.12_180)]" />,
      action: () => { onOpenSettings(); onOpenChange(false); },
      keywords: ['settings', '设置', '偏好'],
      group: 'action',
    },
    {
      id: 'action-theme',
      label: '切换主题',
      description: '暗色 ↔ 亮色模式',
      icon: <Sun className="size-4 text-[oklch(0.70_0.12_180)]" />,
      action: () => { onToggleTheme(); onOpenChange(false); },
      keywords: ['theme', '主题', 'dark', 'light', '暗色', '亮色'],
      group: 'action',
    },
  ];

  // 过滤命令
  const filtered = commands.filter(cmd => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(q))
    );
  });

  // 按 group 分组
  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const groupLabels: Record<string, string> = {
    navigate: '导航',
    action: '操作',
    example: '示例问题',
  };

  // 键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  }, [filtered, selectedIndex, onOpenChange]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 重置选中索引
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // 滚动到选中项
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // 全局快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K 唤起命令面板
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
      // ESC 关闭
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  // 计算全局索引
  let globalIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-[15vh]"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.13_0.005_200)] shadow-2xl"
          >
            {/* 搜索框 */}
            <div className="flex items-center gap-3 border-b border-[oklch(0.70_0.12_180/10%)] px-4 py-3">
              <Search className="size-4 text-[oklch(0.45_0.015_200)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索命令、页面或操作..."
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-[oklch(0.40_0.015_200)]"
              />
              <kbd className="rounded border border-[oklch(0.70_0.12_180/15%)] px-1.5 py-0.5 text-[9px] font-mono text-[oklch(0.45_0.015_200)]">
                ESC
              </kbd>
            </div>

            {/* 命令列表 */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-[oklch(0.50_0.015_200)]">没有找到匹配的命令</p>
                  <p className="mt-1 text-[11px] text-[oklch(0.40_0.015_200)]">试试搜索"历史"、"设置"、"推演"</p>
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group} className="mb-2">
                    <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-[oklch(0.40_0.015_200)]">
                      {groupLabels[group] || group}
                    </div>
                    {items.map((cmd) => {
                      globalIndex++;
                      const isSelected = globalIndex === selectedIndex;
                      return (
                        <button
                          key={cmd.id}
                          data-index={globalIndex}
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                            isSelected
                              ? 'bg-[oklch(0.70_0.12_180/10%)]'
                              : 'hover:bg-[oklch(0.70_0.12_180/5%)]'
                          )}
                        >
                          <span className="shrink-0">{cmd.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              'text-sm',
                              isSelected ? 'text-foreground font-medium' : 'text-[oklch(0.75_0.01_200)]'
                            )}>
                              {cmd.label}
                            </div>
                            {cmd.description && (
                              <div className="text-[11px] text-[oklch(0.45_0.015_200)] truncate">
                                {cmd.description}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <CornerDownLeft className="size-3 shrink-0 text-[oklch(0.70_0.12_180)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[oklch(0.70_0.12_180/10%)] px-4 py-2 text-[10px] font-mono text-[oklch(0.40_0.015_200)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-[oklch(0.70_0.12_180/15%)] px-1">↑</kbd>
                  <kbd className="rounded border border-[oklch(0.70_0.12_180/15%)] px-1">↓</kbd>
                  导航
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-[oklch(0.70_0.12_180/15%)] px-1">↵</kbd>
                  选择
                </span>
              </div>
              <span>OracleMind 命令面板</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
