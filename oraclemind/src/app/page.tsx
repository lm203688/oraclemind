'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { LandingPageV3 } from '@/components/modules/v3/landing-page-v3';
import { PricingPage } from '@/components/modules/v3/pricing-page';
import { StreamingSimulationPanel } from '@/components/modules/v2/streaming-simulation-panel';
import { SimulationHistory } from '@/components/modules/v2/simulation-history';
import { Loader2, ArrowRight, Clock, Sparkles, Compass, User, Globe } from 'lucide-react';

type View = 'landing' | 'config' | 'streaming' | 'result' | 'history' | 'pricing';

interface ForecastConfig {
  query: string;
  forecastType: 'personal' | 'event' | 'compass';
  depth: 'quick' | 'standard' | 'deep';
  birthInfo?: { year: number; month: number; day: number; hour: number };
  context?: string;
  direction?: string;
  activity?: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? 'anonymous';

  const [view, setView] = useState<View>('landing');
  const [config, setConfig] = useState<ForecastConfig | null>(null);
  const [freeCount, setFreeCount] = useState({ used: 0, total: 5 });

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('guest', { guestId: crypto.randomUUID(), redirect: false });
    }
  }, [status]);

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

  // 第一步：用户输入问题
  const handleSearch = useCallback((q: string) => {
    // 自动判断推演类型
    const lowerQ = q.toLowerCase();
    let forecastType: 'personal' | 'event' | 'compass' = 'personal';
    
    // 方位/方向关键词 → 罗盘推演
    if (/方位|方向|direction|move|搬家|relocate|facing|风水|compass|坐向|选址/i.test(q)) {
      forecastType = 'compass';
    }
    // 行业/市场/事件关键词 → 事件推演
    else if (/市场|行业|市场|market|industry|趋势|trend|经济|economy|裁员|政策/i.test(q)) {
      forecastType = 'event';
    }
    // 默认个人推演
    
    setConfig({ query: q, forecastType, depth: 'standard' });
    setView('config');
  }, []);

  // 第二步：用户配置推演参数
  const handleConfigSubmit = useCallback((cfg: ForecastConfig) => {
    setConfig(cfg);
    setView('streaming');
  }, []);

  const handleStreamComplete = useCallback(async () => {
    setView('result');
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
        {/* 第一步：首页输入问题 */}
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

        {/* 第二步：配置推演参数 */}
        {view === 'config' && config && (
          <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ForecastConfigPanel
              config={config}
              onSubmit={handleConfigSubmit}
              onBack={() => setView('landing')}
            />
          </motion.div>
        )}

        {/* 第三步：推演执行 */}
        {view === 'streaming' && config && (
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
                {config.forecastType === 'compass' ? (
                  <CompassResultPanel config={config} />
                ) : (
                  <StreamingSimulationPanel
                    userId={userId}
                    question={config.query}
                    context={config.context}
                    birthInfo={config.birthInfo}
                    rounds={config.depth === 'quick' ? 1 : config.depth === 'standard' ? 3 : 8}
                    simulationType={config.forecastType}
                    onComplete={handleStreamComplete}
                    onBack={() => setView('config')}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'pricing' && (
          <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PricingPage onBack={() => setView('landing')} onSelectPlan={(plan) => console.log('Selected:', plan)} />
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
      </AnimatePresence>
    </div>
  );
}

// ===========================================================================
// 推演配置面板——渐进式信息收集
// ===========================================================================

function ForecastConfigPanel({
  config,
  onSubmit,
  onBack,
}: {
  config: ForecastConfig;
  onSubmit: (cfg: ForecastConfig) => void;
  onBack: () => void;
}) {
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>(config.depth);
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthHour, setBirthHour] = useState('');
  const [context, setContext] = useState('');
  const [direction, setDirection] = useState('N');
  const [activity, setActivity] = useState('');
  const [showBirthInfo, setShowBirthInfo] = useState(false);

  const typeLabel = {
    personal: { icon: User, label: 'Personal Forecast', desc: '5 agents × 5 scrolls cross-validation' },
    event: { icon: Globe, label: 'Event Forecast', desc: 'Multi-agent event simulation' },
    compass: { icon: Compass, label: 'Compass Divination', desc: '24-mountain Luopan analysis' },
  }[config.forecastType];

  const handleSubmit = () => {
    const cfg: ForecastConfig = {
      ...config,
      depth,
      context: context || undefined,
    };
    
    if (showBirthInfo && birthYear && birthMonth && birthDay) {
      cfg.birthInfo = {
        year: parseInt(birthYear),
        month: parseInt(birthMonth),
        day: parseInt(birthDay),
        hour: birthHour ? parseInt(birthHour) : 12,
      };
    }
    
    if (config.forecastType === 'compass') {
      cfg.direction = direction;
      cfg.activity = activity || undefined;
    }
    
    onSubmit(cfg);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/80%)] backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
          <button onClick={onBack} className="flex items-center gap-2 text-xs text-[oklch(0.50_0.015_200)] hover:text-foreground">
            ← Back
          </button>
          <span className="text-[10px] font-mono text-[oklch(0.40_0.015_200)]">Configure Forecast</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* 问题回顾 */}
        <div className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.13_0.005_200/60%)] p-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[oklch(0.50_0.015_200)] mb-2">Your Question</div>
          <p className="text-sm text-foreground">{config.query}</p>
          <div className="mt-3 flex items-center gap-2">
            <typeLabel.icon className="size-3.5 text-[oklch(0.70_0.12_180)]" />
            <span className="text-xs font-semibold text-[oklch(0.70_0.12_180)]">{typeLabel.label}</span>
            <span className="text-[10px] text-[oklch(0.50_0.015_200)]">· {typeLabel.desc}</span>
          </div>
        </div>

        {/* 推演深度选择 */}
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[oklch(0.50_0.015_200)] mb-3">Forecast Depth</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'quick', label: 'Quick', desc: '1 round · ~30s', icon: Clock },
              { key: 'standard', label: 'Standard', desc: '3 rounds · ~2min', icon: Sparkles },
              { key: 'deep', label: 'Deep', desc: '8 rounds · ~5min', icon: Globe },
            ].map((d) => (
              <button
                key={d.key}
                onClick={() => setDepth(d.key as any)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  depth === d.key
                    ? 'border-[oklch(0.70_0.12_180/40%)] bg-[oklch(0.70_0.12_180/10%)]'
                    : 'border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/40%)] hover:border-[oklch(0.70_0.12_180/20%)]'
                }`}
              >
                <d.icon className={`size-4 mb-1 ${depth === d.key ? 'text-[oklch(0.70_0.12_180)]' : 'text-[oklch(0.50_0.015_200)]'}`} />
                <div className={`text-xs font-semibold ${depth === d.key ? 'text-[oklch(0.70_0.12_180)]' : 'text-foreground'}`}>{d.label}</div>
                <div className="text-[10px] text-[oklch(0.50_0.015_200)]">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 罗盘推演——方位和活动 */}
        {config.forecastType === 'compass' && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[oklch(0.50_0.015_200)] mb-2">Direction (Optional)</div>
              <div className="grid grid-cols-8 gap-1">
                {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDirection(d)}
                    className={`rounded border py-2 text-xs font-mono ${
                      direction === d
                        ? 'border-[oklch(0.70_0.12_180/40%)] bg-[oklch(0.70_0.12_180/10%)] text-[oklch(0.70_0.12_180)]'
                        : 'border-[oklch(0.70_0.12_180/10%)] text-[oklch(0.60_0.015_200)]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[oklch(0.50_0.015_200)] mb-2">Activity (Optional)</div>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="e.g., moving, business opening, travel..."
                className="w-full rounded-lg border border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/60%)] px-3 py-2 text-sm text-foreground outline-none focus:border-[oklch(0.70_0.12_180/30%)]"
              />
            </div>
          </div>
        )}

        {/* 个人推演——出生日期（可选，增强精度） */}
        {config.forecastType === 'personal' && (
          <div>
            <button
              onClick={() => setShowBirthInfo(!showBirthInfo)}
              className="flex w-full items-center justify-between rounded-lg border border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/60%)] px-4 py-3 text-left"
            >
              <div>
                <div className="text-xs font-semibold text-foreground">Birth Date & Time (Optional)</div>
                <div className="text-[10px] text-[oklch(0.50_0.015_200)]">Enhances accuracy · Enables Bazi chart analysis</div>
              </div>
              <span className={`text-xs text-[oklch(0.70_0.12_180)] ${showBirthInfo ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showBirthInfo && (
              <div className="mt-2 grid grid-cols-4 gap-2 rounded-lg border border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/40%)] p-3">
                <div>
                  <label className="text-[10px] text-[oklch(0.50_0.015_200)]">Year</label>
                  <input type="number" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} placeholder="1990" className="w-full rounded border border-[oklch(0.70_0.12_180/10%)] bg-background px-2 py-1.5 text-sm text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-[oklch(0.50_0.015_200)]">Month</label>
                  <input type="number" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} placeholder="6" min="1" max="12" className="w-full rounded border border-[oklch(0.70_0.12_180/10%)] bg-background px-2 py-1.5 text-sm text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-[oklch(0.50_0.015_200)]">Day</label>
                  <input type="number" value={birthDay} onChange={(e) => setBirthDay(e.target.value)} placeholder="15" min="1" max="31" className="w-full rounded border border-[oklch(0.70_0.12_180/10%)] bg-background px-2 py-1.5 text-sm text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-[oklch(0.50_0.015_200)]">Hour</label>
                  <input type="number" value={birthHour} onChange={(e) => setBirthHour(e.target.value)} placeholder="10" min="0" max="23" className="w-full rounded border border-[oklch(0.70_0.12_180/10%)] bg-background px-2 py-1.5 text-sm text-foreground outline-none" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 背景信息（可选） */}
        {config.forecastType !== 'compass' && (
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[oklch(0.50_0.015_200)] mb-2">Additional Context (Optional)</div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide more background for a more accurate forecast..."
              rows={3}
              className="w-full rounded-lg border border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/60%)] px-3 py-2 text-sm text-foreground outline-none focus:border-[oklch(0.70_0.12_180/30%)] resize-none"
            />
          </div>
        )}

        {/* 开始推演 */}
        <button
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[oklch(0.70_0.12_180)] py-3 text-sm font-semibold text-white transition-all hover:bg-[oklch(0.70_0.12_180/90%)]"
        >
          Start Forecast
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ===========================================================================
// 罗盘推演结果面板
// ===========================================================================

function CompassResultPanel({ config }: { config: ForecastConfig }) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/simulate/compass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: config.query,
        direction: config.direction,
        activity: config.activity,
      }),
    })
      .then(r => r.json())
      .then(d => {
        setResult(d.result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [config]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[oklch(0.70_0.12_180)]" />
      </div>
    );
  }

  if (!result) {
    return <div className="py-20 text-center text-sm text-[oklch(0.50_0.015_200)]">Compass forecast failed</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[oklch(0.70_0.12_180/25%)] bg-[oklch(0.70_0.12_180/8%)] p-4">
        <div className="mb-1 flex items-center gap-2">
          <Compass className="size-3.5 text-[oklch(0.70_0.12_180)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[oklch(0.70_0.12_180)]">Compass Reading</span>
        </div>
        <p className="text-sm leading-relaxed text-[oklch(0.85_0.01_200)]">{result.advice}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.13_0.005_200/60%)] p-3">
          <div className="text-[10px] font-mono uppercase text-[oklch(0.50_0.015_200)]">Direction</div>
          <div className="text-lg font-bold text-[oklch(0.70_0.12_180)]">{result.direction} · {result.mountain}</div>
          <div className="text-[10px] text-[oklch(0.50_0.015_200)]">{result.details.bagua} · {result.details.element}</div>
        </div>
        <div className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.13_0.005_200/60%)] p-3">
          <div className="text-[10px] font-mono uppercase text-[oklch(0.50_0.015_200)]">Score</div>
          <div className={`text-lg font-bold ${result.auspicious ? 'text-[oklch(0.70_0.14_145)]' : 'text-[oklch(0.65_0.18_25)]'}`}>
            {result.score > 0 ? '+' : ''}{result.score}
          </div>
          <div className="text-[10px] text-[oklch(0.50_0.015_200)]">{result.auspicious ? 'Auspicious' : 'Cautious'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[oklch(0.70_0.14_145/15%)] bg-[oklch(0.70_0.14_145/5%)] p-3">
          <div className="text-[10px] font-mono uppercase text-[oklch(0.70_0.14_145)] mb-1">Best Hours</div>
          <div className="space-y-1">
            {result.details.bestHours.map((h: string, i: number) => (
              <div key={i} className="text-xs text-[oklch(0.70_0.14_145)]">✓ {h}</div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[oklch(0.65_0.18_25/15%)] bg-[oklch(0.65_0.18_25/5%)] p-3">
          <div className="text-[10px] font-mono uppercase text-[oklch(0.65_0.18_25)] mb-1">Avoid Hours</div>
          <div className="space-y-1">
            {result.details.avoidHours.map((h: string, i: number) => (
              <div key={i} className="text-xs text-[oklch(0.65_0.18_25)]">✗ {h}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[oklch(0.70_0.12_180/15%)] bg-[oklch(0.13_0.005_200/60%)] p-3">
        <div className="text-[10px] font-mono uppercase text-[oklch(0.50_0.015_200)] mb-1">Compatible Directions</div>
        <div className="flex gap-2">
          {result.details.compatibleDirections.map((d: string, i: number) => (
            <span key={i} className="rounded border border-[oklch(0.70_0.12_180/20%)] px-2 py-1 text-xs text-[oklch(0.70_0.12_180)]">{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
