'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  FlaskConical,
  Network,
  GitBranch,
  Microscope,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Activity,
  Layers,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingHeroV2Props {
  onStartPersonal?: () => void;
  onStartEvent?: () => void;
  onViewHistory?: () => void;
  onViewAccuracy?: () => void;
}

const FEATURES = [
  {
    icon: <Network className="size-4" />,
    title: '知识图谱接地',
    desc: '从你的生活事件抽取实体关系，构建个人图谱，让推演有据可依而非凭空生成。',
    accent: 'cyan' as const,
  },
  {
    icon: <Cpu className="size-4" />,
    title: '多Agent涌现',
    desc: '5维现代推演（策略/数据/风险/乐观/魔鬼）并行推演，从群体交互中涌现结论。',
    accent: 'cyan' as const,
  },
  {
    icon: <BookOpen className="size-4" />,
    title: '◇ 古典交叉验证',
    desc: '5维古典源流并行验证——从源流、格局、综鉴、旺衰、调候5个独立维度交叉验证，互不依赖。',
    accent: 'bronze' as const,
  },
  {
    icon: <GitBranch className="size-4" />,
    title: 'What-If 反事实',
    desc: '注入变量重跑："如果我换城市呢？"——对比多线未来，做压力测试。',
    accent: 'cyan' as const,
  },
  {
    icon: <Microscope className="size-4" />,
    title: '可查询的轨迹',
    desc: '每轮Agent的推理过程都存档可回放。不止交付结论，更交付可追问的世界。',
    accent: 'cyan' as const,
  },
  {
    icon: <ShieldCheck className="size-4" />,
    title: '5×5 交叉验证矩阵',
    desc: '现代5Agent × 古典5古籍，生成四象限判定：高置信/风险标注/时机未到/强烈避免。',
    accent: 'bronze' as const,
  },
];

const STATS = [
  { value: '10', label: 'Agent 视角' },
  { value: '5×5', label: '交叉验证矩阵' },
  { value: '5', label: '古籍验证层' },
  { value: '8+', label: '轮次涌现' },
];

const EXAMPLE_QUESTIONS = [
  { type: 'personal' as const, text: '我在纠结要不要跳槽去一家创业公司，期权比现在低但成长空间大' },
  { type: 'personal' as const, text: '我该不该在这个阶段和对象谈婚论嫁？时机对不对？' },
  { type: 'personal' as const, text: '考虑明年辞职做自由职业，我的性格和资源适合吗？' },
  { type: 'event' as const, text: '明年 AI 行业会出现大规模裁员潮吗？' },
  { type: 'event' as const, text: '未来12个月国内 SaaS 市场还有机会吗？' },
  { type: 'event' as const, text: '现在入场做 AI 应用创业，时机如何？' },
];

export function LandingHeroV2({ onStartPersonal, onStartEvent, onViewHistory, onViewAccuracy }: LandingHeroV2Props) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Lab Background */}
      <div className="pointer-events-none fixed inset-0">
        {/* Data grid base */}
        <div className="absolute inset-0 data-grid opacity-60" />
        {/* Fine grid overlay */}
        <div className="absolute inset-0 data-grid-fine opacity-30" />
        {/* Cyan radial glow at top */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 15%, oklch(0.70 0.12 180 / 0.10), transparent 70%)',
          }}
        />
        {/* Bronze glow bottom-right (classical layer) */}
        <motion.div
          animate={{ opacity: [0.10, 0.18, 0.10] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-1/4 -right-1/4 size-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.65 0.10 50 / 0.12), transparent 60%)' }}
        />
        {/* Cyan glow bottom-left (modern layer) */}
        <motion.div
          animate={{ opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-1/4 -left-1/4 size-[450px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.70 0.12 180 / 0.10), transparent 60%)' }}
        />
        {/* Scanline */}
        <div className="absolute inset-0 scanline opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          {/* Brand Mark */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center justify-center gap-2.5"
          >
            <div className="flex size-9 items-center justify-center rounded-lg border border-[oklch(0.70_0.12_180/30%)] bg-[oklch(0.16_0.008_200)]">
              <FlaskConical className="size-4 text-[oklch(0.70_0.12_180)]" />
            </div>
            <span className="text-sm font-semibold tracking-widest text-[oklch(0.60_0.015_200)] uppercase font-mono">
              OracleMind
            </span>
            <span className="ml-1 rounded border border-[oklch(0.70_0.12_180/20%)] px-1.5 py-0.5 text-[10px] font-mono text-[oklch(0.55_0.10_180)]">
              v2.0
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="text-foreground">Not fortune-telling.</span>
            <br />
            <span className="cyan-glow bg-gradient-to-r from-[oklch(0.70_0.12_180)] via-[oklch(0.78_0.14_180)] to-[oklch(0.70_0.12_180)] bg-clip-text text-transparent">
              Fore-sight.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[oklch(0.60_0.015_200)] sm:text-base"
          >
            把人生决策放进沙盘，让 <span className="text-[oklch(0.70_0.12_180)] font-semibold">5维现代推演</span> 与 <span className="text-[oklch(0.65_0.10_50)] font-semibold">5维古典验证</span> 并行推演，
            从群体涌现中看见你的下一步。
          </motion.p>

          {/* CTA Buttons — 双入口 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              onClick={onStartPersonal}
              className="h-12 gap-2 rounded-lg border border-[oklch(0.70_0.12_180)] bg-[oklch(0.70_0.12_180)] px-7 text-sm font-semibold text-[oklch(0.13_0.005_200)] shadow-lg shadow-[oklch(0.70_0.12_180/15%)] transition-all hover:shadow-[oklch(0.70_0.12_180/25%)] hover:bg-[oklch(0.75_0.14_180)]"
            >
              <Activity className="size-4" />
              个人生活推演
              <ArrowRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onStartEvent}
              className="h-12 gap-2 rounded-lg border-[oklch(0.70_0.12_180/25%)] bg-transparent px-7 text-sm font-medium text-[oklch(0.70_0.12_180)] transition-all hover:border-[oklch(0.70_0.12_180/40%)] hover:bg-[oklch(0.70_0.12_180/8%)]"
            >
              <Network className="size-4" />
              事件态势推演
            </Button>
          </motion.div>

          {/* History & Accuracy links */}
          {(onViewHistory || onViewAccuracy) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-4 flex items-center gap-4"
            >
              {onViewHistory && (
                <button
                  onClick={onViewHistory}
                  className="text-[11px] font-mono text-[oklch(0.45_0.015_200)] transition-colors hover:text-[oklch(0.70_0.12_180)]"
                >
                  ← 查看历史推演
                </button>
              )}
              {onViewAccuracy && (
                <button
                  onClick={onViewAccuracy}
                  className="text-[11px] font-mono text-[oklch(0.45_0.015_200)] transition-colors hover:text-[oklch(0.70_0.14_145)]"
                >
                  📊 准确率统计
                </button>
              )}
            </motion.div>
          )}

          {/* 精简Stats（移到CTA下方，减少首屏滚动） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono text-[oklch(0.45_0.015_200)]"
          >
            {STATS.map((stat, idx) => (
              <React.Fragment key={stat.label}>
                <span className="flex items-center gap-1">
                  <span className="font-bold text-[oklch(0.70_0.12_180)]">{stat.value}</span>
                  {stat.label}
                </span>
                {idx < STATS.length - 1 && <span className="text-[oklch(0.30_0.015_200)]">·</span>}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 示例问题快捷入口 */}
      <div className="relative z-10 w-full max-w-3xl px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.16_0.008_200/40%)] p-5 backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.55_0.015_200)]">
              [ 示例问题 · 点击直接开始 ]
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => q.type === 'personal' ? onStartPersonal?.() : onStartEvent?.()}
                className="group flex items-start gap-2 rounded border border-[oklch(0.70_0.12_180/12%)] bg-[oklch(0.13_0.005_200/60%)] p-3 text-left transition-all hover:border-[oklch(0.70_0.12_180/30%)] hover:bg-[oklch(0.16_0.008_200/80%)]"
              >
                <span className="mt-0.5 text-[oklch(0.70_0.12_180)]">
                  {q.type === 'personal' ? <Activity className="size-3.5" /> : <Network className="size-3.5" />}
                </span>
                <div className="flex-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.45_0.015_200)] mb-0.5">
                    {q.type === 'personal' ? '个人推演' : '事件推演'}
                  </div>
                  <div className="text-xs text-[oklch(0.75_0.01_200)] leading-relaxed group-hover:text-foreground">
                    {q.text}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 w-full max-w-5xl px-4 pb-16 sm:pb-24">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[oklch(0.45_0.015_200)] font-mono"
        >
          [ Engine Architecture ]
        </motion.h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.65 + idx * 0.07 }}
              className={cn(
                'group rounded-lg border bg-[oklch(0.16_0.008_200/60%)] p-4 backdrop-blur-sm transition-all duration-300',
                feat.accent === 'cyan'
                  ? 'border-[oklch(0.70_0.12_180/15%)] hover:border-[oklch(0.70_0.12_180/35%)] hover:bg-[oklch(0.18_0.015_200/80%)]'
                  : 'border-[oklch(0.65_0.10_50/15%)] hover:border-[oklch(0.65_0.10_50/35%)] hover:bg-[oklch(0.18_0.015_200/80%)]'
              )}
            >
              <div className={cn(
                'mb-2.5 flex size-8 items-center justify-center rounded-md transition-colors',
                feat.accent === 'cyan'
                  ? 'text-[oklch(0.70_0.12_180)] group-hover:bg-[oklch(0.70_0.12_180/10%)]'
                  : 'text-[oklch(0.65_0.10_50)] group-hover:bg-[oklch(0.65_0.10_50/10%)]'
              )}>
                {feat.icon}
              </div>
              <h3 className="mb-1 text-sm font-semibold text-foreground">{feat.title}</h3>
              <p className="text-xs leading-relaxed text-[oklch(0.50_0.015_200)]">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[oklch(0.70_0.12_180/10%)] py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[oklch(0.40_0.015_200)] font-mono">
            <FlaskConical className="size-3" />
            <span>OracleMind Lab &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[oklch(0.40_0.015_200)] font-mono">
            <span className="flex items-center gap-1">
              <Layers className="size-3" /> Multi-Agent
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="size-3" /> 5 Classics Verified
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
