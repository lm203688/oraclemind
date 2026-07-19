'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingPageProps {
  onBack: () => void;
  onSelectPlan?: (plan: string) => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: <Sparkles className="size-5" />,
    color: 'oklch(0.55 0.015 200)',
    border: 'oklch(0.70 0.12 180 / 15%)',
    features: [
      { text: '5 Layer-1 predictions per day', included: true },
      { text: '9 free predictions per IP (incl. 1 deep)', included: true },
      { text: 'Success probability + brief insight', included: true },
      { text: '1 What-If prediction per IP', included: true },
      { text: 'History & sharing', included: true },
      { text: 'Layer-2 personal analysis', included: false },
      { text: 'Unlimited predictions', included: false },
      { text: 'Deep Layer-3 analysis', included: false },
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: 'per month',
    icon: <Crown className="size-5" />,
    color: 'oklch(0.70 0.12 180)',
    border: 'oklch(0.70 0.12 180 / 40%)',
    featured: true,
    features: [
      { text: 'Unlimited Layer-1 predictions', included: true },
      { text: 'Layer-2 personal analysis (with birth data)', included: true },
      { text: 'Full probability breakdown', included: true },
      { text: 'Unlimited What-If predictions', included: true },
      { text: 'Detailed AI reasoning visibility', included: true },
      { text: 'History & sharing', included: true },
      { text: 'Priority processing speed', included: true },
      { text: 'Deep Layer-3 analysis', included: false },
    ],
    cta: 'Subscribe Now',
    ctaDisabled: false,
  },
  {
    id: 'deep',
    name: 'Deep Analysis',
    price: '$4.99',
    period: 'per prediction',
    icon: <Zap className="size-5" />,
    color: 'oklch(0.65 0.10 50)',
    border: 'oklch(0.65 0.10 50 / 30%)',
    features: [
      { text: 'Layer-3 deep multi-agent analysis', included: true },
      { text: '10-perspective cross validation', included: true },
      { text: '8+ rounds of AI reasoning', included: true },
      { text: 'Ancient wisdom verification', included: true },
      { text: 'Full scenario tree (optimistic/neutral/conservative)', included: true },
      { text: 'Actionable recommendations', included: true },
      { text: 'Complete reasoning transparency', included: true },
      { text: 'Export & share full report', included: true },
    ],
    cta: 'Buy Deep Analysis',
    ctaDisabled: false,
  },
];

export function PricingPage({ onBack, onSelectPlan }: PricingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[oklch(0.70_0.12_180/10%)] bg-[oklch(0.13_0.005_200/80%)] backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
          <button onClick={onBack} className="flex items-center gap-2 transition-opacity hover:opacity-70">
            <div className="flex size-7 items-center justify-center rounded-lg border border-[oklch(0.70_0.12_180/20%)] bg-[oklch(0.16_0.008_200)]">
              <Sparkles className="size-3.5 text-[oklch(0.70_0.12_180)]" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-[oklch(0.60_0.015_200)] font-mono">OracleMind</span>
          </button>
          <button onClick={onBack} className="text-[11px] text-[oklch(0.50_0.015_200)] hover:text-foreground">← Back</button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold text-foreground">Choose Your Plan</h1>
          <p className="text-sm text-[oklch(0.55_0.015_200)]">From free exploration to deep destiny analysis</p>
        </motion.div>

        {/* Plans */}
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                'relative rounded-2xl border-2 p-6 backdrop-blur-sm',
                plan.featured ? 'bg-[oklch(0.70_0.12_180/5%)]' : 'bg-[oklch(0.14_0.008_200/60%)]'
              )}
              style={{ borderColor: plan.border }}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[oklch(0.70_0.12_180)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.13_0.005_200)]">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg" style={{ background: `${plan.color} / 10%`, color: plan.color }}>
                {plan.icon}
              </div>

              {/* Name */}
              <h3 className="mb-1 text-lg font-bold text-foreground">{plan.name}</h3>

              {/* Price */}
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-xs text-[oklch(0.45_0.015_200)]">/{plan.period}</span>
              </div>

              {/* CTA */}
              <Button
                onClick={() => !plan.ctaDisabled && onSelectPlan?.(plan.id)}
                disabled={plan.ctaDisabled}
                className={cn(
                  'mt-4 w-full gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all',
                  plan.featured
                    ? 'bg-[oklch(0.70_0.12_180)] text-[oklch(0.13_0.005_200)] hover:bg-[oklch(0.75_0.14_180)]'
                    : plan.ctaDisabled
                    ? 'border border-[oklch(0.70_0.12_180/15%)] text-[oklch(0.45_0.015_200)]'
                    : 'border-2 text-foreground hover:bg-[oklch(0.20_0.008_200)]'
                )}
                style={!plan.featured && !plan.ctaDisabled ? { borderColor: plan.border } : {}}
              >
                {plan.cta}
              </Button>

              {/* Features */}
              <div className="mt-6 space-y-3">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {feat.included ? (
                      <Check className="mt-0.5 size-4 shrink-0" style={{ color: plan.color }} />
                    ) : (
                      <X className="mt-0.5 size-4 shrink-0 text-[oklch(0.35_0.015_200)]" />
                    )}
                    <span className={cn('text-xs', feat.included ? 'text-[oklch(0.75_0.01_200)]' : 'text-[oklch(0.35_0.015_200)]')}>
                      {feat.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Layer explanation */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 rounded-xl border border-[oklch(0.70_0.12_180/12%)] bg-[oklch(0.14_0.008_200/60%)] p-6">
          <h2 className="mb-4 text-center text-sm font-semibold text-foreground">Understanding the Layers</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 inline-flex size-8 items-center justify-center rounded-full border border-[oklch(0.55_0.015_200/30%)] text-xs font-bold text-[oklch(0.55_0.015_200)]">L1</div>
              <h3 className="mb-1 text-xs font-semibold text-foreground">Quick Prediction</h3>
              <p className="text-[10px] leading-relaxed text-[oklch(0.50_0.015_200)]">Fast AI analysis with success probability and brief insight. Perfect for quick questions.</p>
            </div>
            <div className="text-center">
              <div className="mb-2 inline-flex size-8 items-center justify-center rounded-full border border-[oklch(0.70_0.12_180/30%)] text-xs font-bold text-[oklch(0.70_0.12_180)]">L2</div>
              <h3 className="mb-1 text-xs font-semibold text-foreground">Personal Analysis</h3>
              <p className="text-[10px] leading-relaxed text-[oklch(0.50_0.015_200)]">Combines your birth data and personal factors for a more tailored prediction.</p>
            </div>
            <div className="text-center">
              <div className="mb-2 inline-flex size-8 items-center justify-center rounded-full border border-[oklch(0.65_0.10_50/30%)] text-xs font-bold text-[oklch(0.65_0.10_50)]">L3</div>
              <h3 className="mb-1 text-xs font-semibold text-foreground">Deep Analysis</h3>
              <p className="text-[10px] leading-relaxed text-[oklch(0.50_0.015_200)]">Full multi-agent reasoning with ancient wisdom cross-validation. The most comprehensive forecast.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
