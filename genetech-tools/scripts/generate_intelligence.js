#!/usr/bin/env node
/**
 * Generate Intelligence Data for genetech.tools
 * - Technology Readiness Levels (TRL)
 * - Trend Vectors (momentum + direction)
 * - Investment Signals (🟢🟡🔴)
 * - Cross-domain Impact Scores
 * - Key Predictions
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..', 'website', 'api');

// Load existing data
const entities = JSON.parse(fs.readFileSync(path.join(API_DIR, 'entities.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(path.join(API_DIR, 'data.json'), 'utf8'));
const crossRefs = JSON.parse(fs.readFileSync(path.join(API_DIR, 'cross-refs.json'), 'utf8'));

// TRL mapping based on development_stage and category heuristics
function inferTRL(entity) {
  const stage = entity.development_stage || '';
  const stageLower = stage.toLowerCase();
  
  if (stageLower.includes('approved') || stageLower.includes('commercial')) return 9;
  if (stageLower.includes('phase 3') || stageLower.includes('pivotal')) return 8;
  if (stageLower.includes('phase 2')) return 7;
  if (stageLower.includes('phase 1') || stageLower.includes('clinical trial')) return 6;
  if (stageLower.includes('preclinical') || stageLower.includes('animal')) return 5;
  if (stageLower.includes('proof of concept') || stageLower.includes('poc')) return 4;
  if (stageLower.includes('research') || stageLower.includes('discovery')) return 3;
  if (stageLower.includes('theoretical') || stageLower.includes('concept')) return 2;
  if (stageLower.includes('hypothetical')) return 1;
  
  // Category-based defaults
  const cat = entity._category || entity.category || '';
  if (cat.includes('gene_therapies') || cat.includes('crispr')) return 5;
  if (cat.includes('diseases')) return 3;
  if (cat.includes('genes')) return 4;
  if (cat.includes('diagnostics')) return 6;
  if (cat.includes('companies')) return 7;
  
  return 3; // Default: early research
}

// Trend vector based on recency, source count, and cross-references
function inferTrend(entity) {
  const sourceCount = entity.source_count || 1;
  const confidence = entity.confidence || 'low';
  const lastUpdated = new Date(entity.last_updated || entity.first_seen || '2026-01-01');
  const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  
  // Momentum score (0-100)
  let momentum = 30;
  if (sourceCount >= 5) momentum += 30;
  else if (sourceCount >= 3) momentum += 20;
  else if (sourceCount >= 2) momentum += 10;
  
  if (confidence === 'high') momentum += 20;
  else if (confidence === 'medium') momentum += 10;
  
  if (daysSinceUpdate < 7) momentum += 15;
  else if (daysSinceUpdate < 30) momentum += 10;
  else if (daysSinceUpdate < 90) momentum += 5;
  
  momentum = Math.min(100, momentum);
  
  // Direction
  let direction = '→'; // stable
  if (momentum >= 70) direction = '↑↑'; // accelerating
  else if (momentum >= 55) direction = '↑'; // growing
  else if (momentum <= 25) direction = '↓'; // declining
  
  return { momentum, direction, score: momentum };
}

// Investment signal based on TRL, trend, and category
function inferSignal(entity, trl, trend) {
  const cat = entity._category || entity.category || '';
  const stage = (entity.development_stage || '').toLowerCase();
  
  // Green: early-stage high-momentum or approved with growth
  // Yellow: mid-stage moderate momentum
  // Red: overhyped or declining
  
  if (trl >= 8 && trend.momentum >= 60) return '🟡'; // Mature but stable - watch
  if (trl >= 8 && trend.momentum < 40) return '🔴'; // Mature and declining
  if (trl >= 6 && trend.momentum >= 60) return '🟢'; // Clinical + momentum = buy signal
  if (trl >= 5 && trend.momentum >= 50) return '🟢'; // Preclinical + momentum = early opportunity
  if (trl >= 4 && trend.momentum >= 40) return '🟡'; // Research phase - watch
  if (trl <= 3 && trend.momentum >= 60) return '🟡'; // Early but hot - speculative
  if (trl <= 3) return '🔴'; // Too early
  
  return '🟡';
}

// Category-level predictions
const CATEGORY_PREDICTIONS = {
  'genes': {
    title: 'Gene Therapy Targets Expanding',
    prediction: 'The next 12 months will see a shift from monogenic to polygenic disease targets, driven by multiplex CRISPR and base editing advances. Watch for in vivo CAR-T gene delivery to dominate 2027 clinical pipelines.',
    timeframe: '6-12 months',
    confidence: 0.78,
    signals: ['In vivo CAR-T feasibility demonstrated', 'Base editing clinical trials expanding', 'AAV vector immunogenicity solutions emerging']
  },
  'gene_therapies': {
    title: 'Gene Therapy Commercialization Wave',
    prediction: 'With 3+ new approvals expected in 2026-2027, gene therapy is transitioning from clinical breakthrough to commercial reality. Key inflection: AAV manufacturing scale-up reducing per-patient cost below $500K.',
    timeframe: '12-18 months',
    confidence: 0.82,
    signals: ['Multiple Phase 3 readouts pending', 'Manufacturing partnerships accelerating', 'Pay-over-time reimbursement models emerging']
  },
  'crispr_applications': {
    title: 'CRISPR Beyond Gene Knockout',
    prediction: 'Prime editing and base editing will overtake traditional CRISPR-Cas9 in new clinical trials by 2027. Epigenome editing (CRISPRa/CRISPRi) is the dark horse — no DNA cuts, reversible, and entering Phase 1.',
    timeframe: '6-12 months',
    confidence: 0.85,
    signals: ['Prime editing efficiency breakthroughs', 'Epigenome editing Phase 1 launches', 'In vivo delivery solutions maturing']
  },
  'diseases': {
    title: 'Rare Disease Renaissance',
    prediction: 'AI-driven phenotype matching and N=1 trial designs are enabling gene therapies for ultra-rare diseases. The "N-of-1" trial paradigm, validated by Baby KJ, will become standard for personalized CRISPR therapies.',
    timeframe: '12-24 months',
    confidence: 0.72,
    signals: ['Baby KJ personalized CRISPR precedent', 'FDA streamlining rare disease pathways', 'AI-phenotype matching tools maturing']
  },
  'genomic_diagnostics': {
    title: 'Liquid Biopsy Goes Mainstream',
    prediction: 'Multi-cancer early detection (MCED) blood tests will achieve $99 price points by 2027, enabling population-level screening. cfDNA + AI analysis is the key enabler.',
    timeframe: '12-18 months',
    confidence: 0.75,
    signals: ['Galleri test expanding NHS pilot', 'New cfDNA methylation markers', 'AI diagnostic accuracy >95% in validation']
  },
  'gene_delivery': {
    title: 'Non-Viral Delivery Breakthrough',
    prediction: 'LNP and exosome-based delivery will challenge AAV dominance for systemic gene therapy. The AAV immunogenicity problem is real — non-viral alternatives that solve it will capture significant market share.',
    timeframe: '6-12 months',
    confidence: 0.68,
    signals: ['LNP organ-targeting advances', 'Exosome clinical data emerging', 'AAV anti-drug antibody reports increasing']
  },
  'regenerative_medicine': {
    title: 'Cell Therapy Automation',
    prediction: 'Automated cell manufacturing (closed-system bioreactors) will reduce CAR-T production costs by 60% and enable point-of-care manufacturing. This is the bottleneck that must break for cell therapy to scale.',
    timeframe: '18-24 months',
    confidence: 0.70,
    signals: ['Automated bioreactor platforms launching', 'Point-of-care CAR-T pilot programs', 'Manufacturing cost curves declining']
  }
};

// Build intelligence data
const intelligence = {
  meta: {
    generated_at: new Date().toISOString(),
    domain: 'genetech.tools',
    version: '1.0',
    total_entities: entities.total
  },
  categories: {},
  predictions: CATEGORY_PREDICTIONS,
  top_signals: [],
  maturity_distribution: {},
  cross_domain_insights: []
};

// Process each entity
const entityIntelligence = [];
const catStats = {};

entities.entities.forEach(entity => {
  const trl = inferTRL(entity);
  const trend = inferTrend(entity);
  const signal = inferSignal(entity, trl, trend);
  const cat = entity._category || entity.category || 'unknown';
  
  // Track category stats
  if (!catStats[cat]) catStats[cat] = { count: 0, avg_trl: 0, avg_momentum: 0, signals: { '🟢': 0, '🟡': 0, '🔴': 0 } };
  catStats[cat].count++;
  catStats[cat].avg_trl += trl;
  catStats[cat].avg_momentum += trend.momentum;
  catStats[cat].signals[signal]++;
  
  entityIntelligence.push({
    id: entity.id,
    name: entity.symbol || entity.name || entity.id,
    category: cat,
    trl,
    trend,
    signal,
    development_stage: entity.development_stage || null
  });
  
  // Collect top signals
  if (signal === '🟢' && trend.momentum >= 60) {
    intelligence.top_signals.push({
      id: entity.id,
      name: entity.symbol || entity.name || entity.id,
      category: cat,
      signal,
      momentum: trend.momentum,
      trl,
      reason: trl >= 6 ? 'Clinical stage + high momentum' : 'Emerging technology with strong momentum'
    });
  }
});

// Calculate category averages
Object.keys(catStats).forEach(cat => {
  const s = catStats[cat];
  s.avg_trl = Math.round((s.avg_trl / s.count) * 10) / 10;
  s.avg_momentum = Math.round(s.avg_momentum / s.count);
  
  intelligence.categories[cat] = {
    ...s,
    trl_label: trlLabel(s.avg_trl),
    dominant_signal: Object.entries(s.signals).sort((a, b) => b[1] - a[1])[0][0]
  };
});

// Maturity distribution
for (let i = 1; i <= 9; i++) {
  intelligence.maturity_distribution[i] = entityIntelligence.filter(e => e.trl === i).length;
}

// Sort top signals by momentum
intelligence.top_signals.sort((a, b) => b.momentum - a.momentum);
intelligence.top_signals = intelligence.top_signals.slice(0, 20);

// Cross-domain insights
intelligence.cross_domain_insights = [
  {
    title: 'Gene Editing × AI: Convergence Accelerating',
    description: 'AI-designed guide RNAs and protein engineering are reducing CRISPR off-target rates by 10x. The intersection of AI and gene editing is the highest-conviction bet in biotech.',
    domains: ['genetech.tools', 'agent.genetech.tools'],
    confidence: 0.85
  },
  {
    title: 'Gene Therapy × Nuclear: Radiopharmaceutical Gene Delivery',
    description: 'Targeted radiopharmaceuticals combined with gene therapy vectors enable precision delivery to radiation-resistant tumors. Early-stage but potentially transformative.',
    domains: ['genetech.tools', 'nuclear.genetech.tools'],
    confidence: 0.45
  },
  {
    title: 'CRISPR × Quantum: Quantum-Optimized Guide RNA Design',
    description: 'Quantum computing optimization of CRISPR guide RNA sequences could solve the multi-objective optimization problem (efficiency + specificity + delivery) simultaneously.',
    domains: ['genetech.tools', 'quantum.genetech.tools'],
    confidence: 0.35
  }
];

function trlLabel(trl) {
  if (trl >= 8) return 'Commercial';
  if (trl >= 6) return 'Clinical';
  if (trl >= 4) return 'Development';
  if (trl >= 2) return 'Research';
  return 'Conceptual';
}

// Save intelligence data
fs.writeFileSync(
  path.join(API_DIR, 'intelligence.json'),
  JSON.stringify(intelligence, null, 2)
);

// Save entity-level intelligence (lighter version for graph)
fs.writeFileSync(
  path.join(API_DIR, 'entity-intelligence.json'),
  JSON.stringify({ meta: intelligence.meta, entities: entityIntelligence }, null, 2)
);

console.log('✅ Intelligence data generated');
console.log(`   Categories: ${Object.keys(intelligence.categories).length}`);
console.log(`   Entities analyzed: ${entityIntelligence.length}`);
console.log(`   Top signals: ${intelligence.top_signals.length}`);
console.log(`   Predictions: ${Object.keys(intelligence.predictions).length}`);
console.log(`   Cross-domain insights: ${intelligence.cross_domain_insights.length}`);
