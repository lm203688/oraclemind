'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ArrowRight,
  Brain,
  BookOpen,
  ShieldCheck,
  ChevronDown,
  Zap,
  Crown,
  Loader2,
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
  const remaining = freeCount.total - freeCount.used;

  const handleSearch = () => {
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 data-grid opacity-40" />
        <div className="absolute inset-0 data-grid-fine opacity-20" />
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse 50% 30% at 50% 20%, oklch(0.70 0.12 180 / 0.08), transparent 70%)' }} />
        <motion.div animate={{ opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-1/4 -right-1/4 size-[500px] rounded-full" style={{ background: 'radial-gradient(circle, oklch(0.65 0.10 50 / 0.10), transparent 60%)' }} />
        <motion.div animate={{ opacity: [0.06, 0.12, 0.06] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="absolute -bottom-1/4 -left-1/4 size-[450px] rounded-full" style={{ background: 'radial-gradient(circle, oklch(0.70 0.12 180 / 0.08), transparent 60%)' }} />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center">
        <header className="flex w-full items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg border border-[oklch(0.70_0.12_180/30%)] bg-[oklch(0.16_0.008_200)]">
              <Sparkles className="size-4 text-[oklch(0.70_0.12_180)]" />
            </div>
            <span className="text-sm font-bold tracking-wider text-foreground font-mono">OracleMind</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onViewHistory} className="text-xs text-[oklch(0.50_0.015_200)] transition-colors hover:text-foreground">History</button>
            <button onClick={onViewPricing} className="text-xs text-[oklch(0.50_0.015_200)] transition-colors hover:text-foreground">Pricing</button>
            <Button size="sm" onClick={onViewPricing} className="h-7 gap-1 bg-[oklch(0.70_0.12_180)] text-[10px] font-semibold text-[oklch(0.13_0.005_200)] hover:bg-[oklch(0.75_0.14_180)]">
              <Crown className="size-3" /> Go Premium
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-2xl text-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6 flex items-center justify-center gap-2">
              <span className="rounded-full border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.70_0.12_180/5%)] px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">AI-Powered Destiny Forecast</span>
            </motion.div>

            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              What does the<br />
              <span className="cyan-glow bg-gradient-to-r from-[oklch(0.70_0.12_180)] via-[oklch(0.78_0.14_180)] to-[oklch(0.70_0.12_180)] bg-clip-text text-transparent">future hold?</span>
            </h1>

            <p className="mx-auto mb-10 max-w-lg text-sm leading-relaxed text-[oklch(0.55_0.015_200)] sm:text-base">
              Ancient wisdom meets artificial intelligence. Our engine combines 5,000 years of Eastern divination with modern multi-agent AI reasoning to forecast the probability of your future outcomes.
            </p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={cn('relative mx-auto max-w-xl rounded-2xl border bg-[oklch(0.14_0.008_200/80%)] backdrop-blur-md transition-all', isFocused ? 'border-[oklch(0.70_0.12_180/50%)] shadow-lg shadow-[oklch(0.70_0.12_180/10%)]' : 'border-[oklch(0.70_0.12_180/15%)]')}>
              <div className="flex items-center gap-3 px-5 py-4">
                <Sparkles className={cn('size-5 shrink-0 transition-colors', isFocused ? 'text-[oklch(0.70_0.12_180)]' : 'text-[oklch(0.40_0.015_200)]')} />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="Ask anything about your future..." className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-[oklch(0.40_0.015_200)]" maxLength={500} />
                <Button onClick={handleSearch} disabled={!query.trim()} size="sm" className="h-9 gap-1.5 rounded-xl bg-[oklch(0.70_0.12_180)] px-4 text-sm font-semibold text-[oklch(0.13_0.005_200)] shadow-md shadow-[oklch(0.70_0.12_180/15%)] transition-all hover:bg-[oklch(0.75_0.14_180)] disabled:opacity-30">
                  Divine <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 flex items-center justify-center gap-2">
              <span className="text-[11px] text-[oklch(0.45_0.015_200)]">
                {remaining > 0 ? (<><span className="font-bold text-[oklch(0.70_0.14_145)]">{remaining}</span> free predictions remaining today</>) : (<>Daily free limit reached — <button onClick={onViewPricing} className="text-[oklch(0.70_0.12_180)] underline">Go Premium</button> for unlimited</>)}
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8">
              <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-[oklch(0.40_0.015_200)]">Try asking</div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['Should I change jobs this year?', 'Will my relationship last?', 'Is it a good time to start a business?', 'Will the stock market go up next month?'].map((q, i) => (
                  <button key={i} onClick={() => setQuery(q)} className="rounded-full border border-[oklch(0.70_0.12_180/12%)] bg-[oklch(0.12_0.008_200/60%)] px-3 py-1.5 text-[11px] text-[oklch(0.60_0.015_200)] transition-all hover:border-[oklch(0.70_0.12_180/30%)] hover:text-[oklch(0.70_0.12_180)]">{q}</button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="w-full max-w-4xl px-4 pb-12">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <h2 className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[oklch(0.45_0.015_200)] font-mono">How It Works</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[{ icon: <Sparkles className="size-4" />, title: 'Ask Your Question', desc: 'Type any question about your future — career, love, health, or major life decisions.' }, { icon: <Brain className="size-4" />, title: 'AI Cross-References', desc: 'Our engine cross-references ancient divination traditions with multi-agent AI reasoning.' }, { icon: <ShieldCheck className="size-4" />, title: 'Get Your Forecast', desc: 'Receive a probability-based forecast with confidence levels and actionable insights.' }].map((step, idx) => (
                <div key={idx} className="rounded-lg border border-[oklch(0.70_0.12_180/12%)] bg-[oklch(0.14_0.008_200/60%)] p-5 backdrop-blur-sm">
                  <div className="mb-3 flex size-8 items-center justify-center rounded-md bg-[oklch(0.70_0.12_180/10%)] text-[oklch(0.70_0.12_180)]">{step.icon}</div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="text-xs leading-relaxed text-[oklch(0.50_0.015_200)]">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <footer className="w-full border-t border-[oklch(0.70_0.12_180/8%)] py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4">
            <div className="flex items-center gap-1.5 text-[10px] text-[oklch(0.40_0.015_200)] font-mono">
              <Sparkles className="size-2.5" /><span>OracleMind © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[oklch(0.40_0.015_200)] font-mono">
              <span>Ancient Wisdom × AI</span><button onClick={onViewPricing} className="hover:text-foreground">Pricing</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
