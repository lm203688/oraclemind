'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { LandingPageV3 } from '@/components/modules/v3/landing-page-v3';
import { PricingPage } from '@/components/modules/v3/pricing-page';
import { StreamingSimulationPanel } from '@/components/modules/v2/streaming-simulation-panel';
import { SimulationHistory } from '@/components/modules/v2/simulation-history';
import { Loader2 } from 'lucide-react';

type View = 'landing' | 'streaming' | 'result' | 'history' | 'pricing';

export default function Home() {
  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? 'anonymous';

  const [view, setView] = useState<View>('landing');
  const [query, setQuery] = useState('');
  const [freeCount, setFreeCount] = useState({ used: 0, total: 5 });

  // Auto sign-in as guest
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('guest', { guestId: crypto.randomUUID(), redirect: false });
    }
  }, [status]);

  // Fetch free count
  useEffect(() => {
    if (userId !== 'anonymous') {
      fetch(`/api/rate-limit?userId=${userId}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data) {
            setFreeCount({ used: d.data.used, total: d.data.total });
          }
        })
        .catch(() => {});
    }
  }, [userId]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setView('streaming');
  }, []);

  const handleStreamComplete = useCallback(async (event: any) => {
    setView('result');
    // Refresh free count
    fetch(`/api/rate-limit?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setFreeCount({ used: d.data.used, total: d.data.total });
        }
      })
      .catch(() => {});
  }, [userId]);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPageV3
              onSearch={handleSearch}
              onViewPricing={() => setView('pricing')}
              onViewHistory={() => setView('history')}
              freeCount={freeCount}
            />
          </motion.div>
        )}

        {view === 'pricing' && (
          <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PricingPage onBack={() => setView('landing')} onSelectPlan={(plan) => console.log('Selected:', plan)} />
          </motion.div>
        )}

        {view === 'streaming' && (
          <motion.div key="streaming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="min-h-screen">
              <header className="sticky top-0 z-50 border-b border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/80%)] backdrop-blur-xl">
                <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
                  <button onClick={() => setView('landing')} className="flex items-center gap-2 text-xs text-[oklch(0.50_0.015_200)] hover:text-foreground">
                    ← Back
                  </button>
                  <span className="text-[10px] font-mono text-[oklch(0.40_0.015_200)]">OracleMind Forecast Engine</span>
                </div>
              </header>
              <div className="mx-auto max-w-4xl px-4 py-6">
                <StreamingSimulationPanel
                  userId={userId}
                  question={query}
                  rounds={3}
                  simulationType="personal"
                  onComplete={handleStreamComplete}
                  onBack={() => setView('landing')}
                />
              </div>
            </div>
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="min-h-screen">
              <header className="sticky top-0 z-50 border-b border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/80%)] backdrop-blur-xl">
                <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
                  <button onClick={() => setView('landing')} className="flex items-center gap-2 text-xs text-[oklch(0.50_0.015_200)] hover:text-foreground">
                    ← Back
                  </button>
                  <span className="text-[10px] font-mono text-[oklch(0.40_0.015_200)]">History</span>
                </div>
              </header>
              <div className="mx-auto max-w-4xl px-4 py-6">
                <SimulationHistory userId={userId} onBack={() => setView('landing')} />
              </div>
            </div>
          </motion.div>
        )}

        {view === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="min-h-screen">
              <header className="sticky top-0 z-50 border-b border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/80%)] backdrop-blur-xl">
                <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
                  <button onClick={() => setView('landing')} className="flex items-center gap-2 text-xs text-[oklch(0.50_0.015_200)] hover:text-foreground">
                    ← New Prediction
                  </button>
                  <button onClick={() => setView('history')} className="text-xs text-[oklch(0.50_0.015_200)] hover:text-foreground">
                    History
                  </button>
                </div>
              </header>
              <div className="mx-auto max-w-4xl px-4 py-6">
                <div className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.14_0.008_200/60%)] p-6 text-center">
                  <p className="text-sm text-[oklch(0.60_0.015_200)]">Prediction complete. Full result view loading...</p>
                  <Loader2 className="mx-auto mt-3 size-5 animate-spin text-[oklch(0.70_0.12_180)]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
