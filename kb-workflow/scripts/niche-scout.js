/**
 * 冷门知识库方向自动侦察
 * - 搜索冷门专业领域
 * - 评估数据可获取性、市场规模、竞争度
 * - 输出推荐报告
 * 
 * 用法: node niche-scout.js
 */
const fs = require('fs');
const path = require('path');

const BASE = '/home/z/my-project';
const NODE_PATH = '/home/z/.bun/install/global/node_modules';
const REPORTS_DIR = path.join(BASE, 'kb-workflow/reports');

if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

// Candidate niche areas to evaluate
const CANDIDATE_NICHES = [
  {
    name: '机器人配件协议库',
    domain: 'robot.genetech.tools',
    keywords: ['robot parts standardization', 'modular robotics components', 'robot actuator servo comparison'],
    data_sources: ['厂商产品手册', 'ROS2文档', 'ISO标准', 'EtherCAT/CANopen协议规范'],
    market_size: '$178亿（执行器）+$54亿（模块化机器人）',
    competition: '无商业化产品',
    feasibility: 'high'
  },
  {
    name: '稀有病药物情报库',
    domain: 'orphan.genetech.tools',
    keywords: ['orphan drug database', 'rare disease treatment', 'FDA orphan drug designation'],
    data_sources: ['FDA Orange Book', 'EMA', 'ClinicalTrials.gov', 'Orphanet'],
    market_size: '$2400亿（孤儿药市场）',
    competition: 'Evaluate等年费$5万+',
    feasibility: 'high'
  },
  {
    name: '电池材料数据库',
    domain: 'battery.genetech.tools',
    keywords: ['battery materials database', 'solid state battery materials', 'electrolyte comparison'],
    data_sources: ['Materials Project', 'AFLAS', '292K+电池材料记录'],
    market_size: '$780亿（电池材料）',
    competition: '全是学术项目',
    feasibility: 'medium'
  },
  {
    name: '半导体供应链图谱',
    domain: 'chip.genetech.tools',
    keywords: ['semiconductor supply chain', 'chip manufacturer database', 'fab capacity'],
    data_sources: ['公开财报', '专利数据', '进出口数据', 'SEMI报告'],
    market_size: '$4500亿（半导体）',
    competition: '少量付费产品',
    feasibility: 'medium'
  },
  {
    name: '专利到期药物库',
    domain: 'patent.genetech.tools',
    keywords: ['drug patent expiry', 'generic drug opportunity', 'patent cliff database'],
    data_sources: ['FDA Orange Book', 'USPTO', 'EMA专利数据'],
    market_size: '$2000亿+（仿制药）',
    competition: '少量高价产品',
    feasibility: 'high'
  }
];

// Existing projects (skip these)
const EXISTING = ['genetech-tools', 'tcm-tools'];

async function evaluateNiche(niche) {
  console.log(`\n🔎 Evaluating: ${niche.name}`);
  
  let searchScore = 0;
  let dataScore = 0;
  let marketScore = 0;
  let competitionScore = 0;
  
  try {
    const sdk = require(require.resolve('z-ai-web-dev-sdk', { paths: [NODE_PATH] }));
    const ZAI = sdk.default;
    const zai = await ZAI.create();
    
    // Search for existing commercial products
    const searchQuery = `${niche.keywords[0]} commercial database product`;
    const result = await zai.webSearch({ query: searchQuery, num: 5 });
    
    if (result && result.length > 0) {
      // Fewer results = less competition = better
      competitionScore = Math.max(1, 10 - result.length);
      console.log(`  Competition: ${result.length} competitors found (score: ${competitionScore})`);
    } else {
      competitionScore = 10; // No competition!
      console.log('  Competition: None found (score: 10)');
    }
  } catch (e) {
    console.log(`  Search error: ${e.message}`);
    competitionScore = 5; // Default
  }
  
  // Score based on predefined assessment
  dataScore = niche.feasibility === 'high' ? 8 : niche.feasibility === 'medium' ? 5 : 3;
  marketScore = niche.market_size.includes('亿') ? 8 : 5;
  searchScore = 7; // Default interest score
  
  const totalScore = (searchScore + dataScore + marketScore + competitionScore) / 4;
  
  return {
    ...niche,
    scores: { search: searchScore, data: dataScore, market: marketScore, competition: competitionScore },
    totalScore: totalScore.toFixed(1),
    recommendation: totalScore >= 7 ? '🟢 强烈推荐' : totalScore >= 5 ? '🟡 可以考虑' : '🔴 暂不推荐'
  };
}

async function run() {
  console.log('🔍 Niche Scout - 冷门知识库方向侦察');
  console.log(`   评估 ${CANDIDATE_NICHES.length} 个候选方向...\n`);
  
  const results = [];
  for (const niche of CANDIDATE_NICHES) {
    const evaluated = await evaluateNiche(niche);
    results.push(evaluated);
  }
  
  // Sort by score
  results.sort((a, b) => parseFloat(b.totalScore) - parseFloat(a.totalScore));
  
  // Print ranking
  console.log('\n🏆 推荐排名:');
  results.forEach((r, i) => {
    console.log(`  ${i+1}. ${r.recommendation} ${r.name} (${r.domain}) - Score: ${r.totalScore}`);
    console.log(`     市场: ${r.market_size} | 竞争: ${r.competition} | 数据: ${r.feasibility}`);
  });
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    type: 'niche-scout',
    results: results.map(r => ({
      name: r.name, domain: r.domain, totalScore: r.totalScore,
      recommendation: r.recommendation, market_size: r.market_size,
      competition: r.competition, data_sources: r.data_sources
    }))
  };
  
  const reportFile = path.join(REPORTS_DIR, `niche_scout_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved: ${reportFile}`);
}

run().catch(console.error);
