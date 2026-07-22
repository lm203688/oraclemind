'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Sparkles, ArrowRight, Brain, BookOpen, ShieldCheck, ChevronDown,
  Zap, Crown, Loader2, Orbit, Star, Moon, Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingPageV3Props {
  onSearch: (query: string) => void;
  onViewPricing: () => void;
  onViewHistory: () => void;
  freeCount: { used: number; total: number };
}

export function LandingPageV3({ onSearch, onViewPricing, onViewHistory, freeCount }: LandingPageV3Props) {
  const [query, setQuery] = useState('');
  const [isFocused, setFocused] = useState(false);
  const [isDivining, setIsDivining] = useState(false);
  const [constellation, setConstellation] = useState<Array<{x:number,y:number,delay:number}>>([]);
  const remaining = freeCount.total - freeCount.used;

  // 生成星座背景
  useEffect(() => {
    const stars = Array.from({length: 60}, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setConstellation(stars);
  }, []);

  const handleSearch = () => {
    if (!query.trim() || isDivining) return;
    setIsDivining(true);
    setTimeout(() => {
      onSearch(query.trim());
      setIsDivining(false);
    }, 1200); // 仪式感延迟
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.08_0.02_280)]">
      {/* 星空背景 */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 10%, oklch(0.25_0.08_280/0.15), transparent 70%)' }} />
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse 40% 30% at 80% 80%, oklch(0.30_0.10_50/0.12), transparent 70%)' }} />

        {/* 星星 */}
        {constellation.map((star, i) => (
          <motion.div
            key={i}
            className="absolute size-0.5 rounded-full bg-white"
            style={{ left: `${star.x}%`, top: `${star.y}%` }}
            animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: star.delay }}
          />
        ))}

        {/* 光晕 */}
        <motion.div
          animate={{ opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1/4 -right-1/4 size-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.50_0.15_280/0.15), transparent 60%)' }}
        />
        <motion.div
          animate={{ opacity: [0.04, 0.10, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-1/4 -left-1/4 size-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.55_0.12_50/0.12), transparent 60%)' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center">
        {/* 导航栏 */}
        <header className="flex w-full items-center justify-between px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-9 items-center justify-center rounded-lg border border-[oklch(0.50_0.15_280/40%)] bg-[oklch(0.15_0.03_280)]">
              <Orbit className="size-4 text-[oklch(0.60_0.15_280)]" />
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{ boxShadow: ['0 0 0 0 oklch(0.50_0.15_280/0)', '0 0 20px 2px oklch(0.50_0.15_280/0.2)', '0 0 0 0 oklch(0.50_0.15_280/0)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <span className="text-sm font-bold tracking-[0.2em] text-foreground font-mono">ORACLEMIND</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onViewHistory} className="text-xs text-[oklch(0.55_0.02_280)] transition-colors hover:text-foreground">History</button>
            <button onClick={onViewPricing} className="text-xs text-[oklch(0.55_0.02_280)] transition-colors hover:text-foreground">Pricing</button>
            <Button size="sm" onClick={onViewPricing} className="h-7 gap-1 border border-[oklch(0.50_0.15_280/30%)] bg-[oklch(0.15_0.05_280)] text-[10px] font-semibold text-[oklch(0.65_0.12_280)] hover:bg-[oklch(0.20_0.06_280)]">
              <Crown className="size-3" /> Go Premium
            </Button>
          </div>
        </header>

        {/* 主内容 */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-2xl text-center">
            {/* 徽章 */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8 flex items-center justify-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-[oklch(0.50_0.15_280/25%)] bg-[oklch(0.12_0.04_280/60%)] px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-[oklch(0.60_0.12_280)] backdrop-blur-sm">
                <Star className="size-3" /> AI-Powered Destiny Forecast
              </span>
            </motion.div>

            {/* 标题——神秘+高级 */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl">
              <span className="block text-[oklch(0.85_0.02_280)]">What does the</span>
              <motion.span
                className="mt-2 block bg-gradient-to-r from-[oklch(0.55_0.15_280)] via-[oklch(0.65_0.18_50)] to-[oklch(0.55_0.15_280)] bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 200%' }}
              >
                future hold?
              </motion.span>
            </h1>

            <p className="mx-auto mb-12 max-w-lg text-sm leading-relaxed text-[oklch(0.55_0.02_280)] sm:text-base">
              Ancient wisdom meets artificial intelligence. Our engine combines 5,000 years of Eastern divination with modern multi-agent AI to forecast the probability of your future.
            </p>

            {/* 输入区——仪式感 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={cn(
                'relative mx-auto max-w-xl rounded-2xl backdrop-blur-xl transition-all duration-500',
                isFocused
                  ? 'border border-[oklch(0.50_0.15_280/50%)] bg-[oklch(0.12_0.04_280/90%)] shadow-[0_0_40px_oklch(0.50_0.15_280/15%)]'
                  : 'border border-[oklch(0.40_0.08_280/30%)] bg-[oklch(0.10_0.03_280/70%)]'
              )}
            >
              {/* 聚焦时的光环 */}
              {isFocused && (
                <motion.div
                  className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[oklch(0.50_0.15_280/10%)] to-[oklch(0.55_0.18_50/10%)] blur-md"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                />
              )}
              <div className="relative flex items-center gap-3 px-6 py-5">
                <motion.div
                  animate={isFocused ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 4, repeat: isFocused ? Infinity : 0, ease: 'linear' }}
                >
                  {isDivining ? (
                    <Loader2 className="size-5 shrink-0 animate-spin text-[oklch(0.60_0.15_280)]" />
                  ) : (
                    <Sparkles className={cn('size-5 shrink-0 transition-colors', isFocused ? 'text-[oklch(0.60_0.15_280)]' : 'text-[oklch(0.45_0.05_280)]')} />
                  )}
                </motion.div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Ask the oracle anything..."
                  className="flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-[oklch(0.40_0.03_280)]"
                  maxLength={500}
                />
                <Button
                  onClick={handleSearch}
                  disabled={!query.trim() || isDivining}
                  size="sm"
                  className={cn(
                    'h-10 gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-300',
                    query.trim() && !isDivining
                      ? 'bg-gradient-to-r from-[oklch(0.50_0.15_280)] to-[oklch(0.55_0.15_280)] text-white shadow-[0_0_20px_oklch(0.50_0.15_280/30%)] hover:shadow-[0_0_30px_oklch(0.50_0.15_280/50%)]'
                      : 'bg-[oklch(0.20_0.03_280)] text-[oklch(0.40_0.03_280)]'
                  )}
                >
                  {isDivining ? (
                    <><Loader2 className="size-4 animate-spin" /> Divining...</>
                  ) : (
                    <>Divine <ArrowRight className="size-4" /></>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* 免费额度——优雅展示 */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.40_0.08_280/20%)] bg-[oklch(0.10_0.03_280/60%)] px-4 py-1.5 backdrop-blur-sm">
                {remaining > 0 ? (
                  <span className="text-[11px] text-[oklch(0.50_0.02_280)]">
                    <span className="inline-flex items-center gap-1.5">
                      {Array.from({length: Math.min(remaining, 5)}).map((_, i) => (
                        <motion.span
                          key={i}
                          className="inline-block size-1.5 rounded-full bg-[oklch(0.60_0.15_280)]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </span>
                    <span className="ml-2">{remaining} free forecasts remaining</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-[oklch(0.55_0.05_280)]">
                    Daily limit reached · <button onClick={onViewPricing} className="text-[oklch(0.60_0.15_280)] underline">Go Premium</button>
                  </span>
                )}
              </div>
            </motion.div>

            {/* 示例问题——高级按钮 */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10">
              <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.25em] text-[oklch(0.40_0.03_280)]">✦ Try asking</div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {[
                  { q: 'Should I change jobs this year?', icon: '🔮' },
                  { q: 'Will my relationship last?', icon: '💫' },
                  { q: 'Is it a good time to start a business?', icon: '⚡' },
                  { q: 'Will the stock market go up?', icon: '📊' },
                ].map((item, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setQuery(item.q)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-2 rounded-full border border-[oklch(0.40_0.08_280/25%)] bg-[oklch(0.12_0.04_280/50%)] px-4 py-2 text-[12px] text-[oklch(0.55_0.02_280)] backdrop-blur-sm transition-all hover:border-[oklch(0.50_0.15_280/40%)] hover:bg-[oklch(0.15_0.05_280/70%)] hover:text-[oklch(0.70_0.10_280)]"
                  >
                    <span className="text-sm opacity-70 group-hover:opacity-100">{item.icon}</span>
                    {item.q}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* How It Works——带图标和连线 */}
        <div className="w-full max-w-4xl px-4 pb-16">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <h2 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[oklch(0.45_0.02_280)] font-mono">
              ✦ How It Works ✦
            </h2>
            <div className="relative grid gap-6 sm:grid-cols-3">
              {/* 连线 */}
              <div className="pointer-events-none absolute left-1/6 right-1/6 top-12 hidden h-px bg-gradient-to-r from-transparent via-[oklch(0.40_0.08_280/30%)] to-transparent sm:block" />

              {[
                { icon: <Moon className="size-5" />, step: '01', title: 'Ask Your Question', desc: 'Type any question about your future — career, love, or major life decisions.' },
                { icon: <Brain className="size-5" />, step: '02', title: 'AI Cross-References', desc: '10 dimensional vectors cross-validate: ancient scrolls × modern AI agents.' },
                { icon: <Sun className="size-5" />, step: '03', title: 'Receive Forecast', desc: 'Probability-based forecast with confidence levels and actionable insights.' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + idx * 0.15 }}
                  className="relative rounded-xl border border-[oklch(0.40_0.08_280/20%)] bg-[oklch(0.12_0.04_280/60%)] p-6 backdrop-blur-sm transition-all hover:border-[oklch(0.50_0.15_280/30%)] hover:bg-[oklch(0.14_0.05_280/70%)]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-[oklch(0.50_0.15_280/25%)] bg-[oklch(0.15_0.05_280)] text-[oklch(0.60_0.15_280)]">
                      {item.icon}
                    </div>
                    <span className="text-xs font-mono text-[oklch(0.35_0.02_280)]">{item.step}</span>
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-[oklch(0.50_0.02_280)]">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 底部 */}
        <footer className="w-full border-t border-[oklch(0.40_0.08_280/10%)] py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4">
            <div className="flex items-center gap-1.5 text-[10px] text-[oklch(0.40_0.02_280)] font-mono">
              <Sparkles className="size-2.5" /><span>OracleMind © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[oklch(0.40_0.02_280)] font-mono">
              <span>Ancient Wisdom × AI</span>
              <button onClick={onViewPricing} className="hover:text-foreground">Pricing</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
