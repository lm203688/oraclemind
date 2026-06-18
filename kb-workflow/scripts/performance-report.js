/**
 * 知识库性能报告生成器
 * - 流量估算（基于搜索引擎收录状态）
 * - 知识库数据质量评分
 * - 变现状态追踪
 * 
 * 用法: node performance-report.js [monthly]
 */
const fs = require('fs');
const path = require('path');

const BASE = '/home/z/my-project';
const REPORTS_DIR = path.join(BASE, 'kb-workflow/reports');

if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const PROJECTS = [
  {
    name: 'GeneTech Tools',
    path: 'genetech-tools',
    domain: 'genetech.tools',
    type: 'gene_therapy',
    monetization: { affiliate: true, pro: '$29/mo', report: '$199' }
  },
  {
    name: 'TCMDB',
    path: 'tcm-tools',
    domain: 'tcm.genetech.tools',
    type: 'tcm',
    monetization: { affiliate: false, pro: '$29/mo', report: '$199' }
  }
];

function analyzeProject(project) {
  const kbPath = path.join(BASE, project.path, 'knowledge-base');
  const stats = {};
  
  // Count entities
  try {
    const entityFiles = fs.readdirSync(path.join(kbPath, 'entities'));
    for (const f of entityFiles) {
      if (f.endsWith('.json')) {
        const data = JSON.parse(fs.readFileSync(path.join(kbPath, 'entities', f), 'utf8'));
        const key = data.description || f.replace('.json', '');
        stats[key] = (data.entities || data.relations || []).length;
      }
    }
  } catch (e) { stats.error = e.message; }
  
  // Check last collection
  let lastCollection = 'never';
  try {
    const log = JSON.parse(fs.readFileSync(path.join(kbPath, 'metadata/collection_log.json'), 'utf8'));
    if (log.runs && log.runs.length > 0) {
      lastCollection = log.runs[log.runs.length - 1].completed_at || 'unknown';
    }
  } catch (e) {}
  
  // Check controversies
  let controversyCount = 0;
  try {
    const cont = JSON.parse(fs.readFileSync(path.join(kbPath, 'controversies/controversies.json'), 'utf8'));
    controversyCount = (cont.controversies || []).length;
  } catch (e) {}
  
  return {
    name: project.name,
    domain: project.domain,
    stats,
    lastCollection,
    controversies: controversyCount,
    monetization: project.monetization,
    healthScore: Object.keys(stats).length > 0 ? '🟢' : '🔴'
  };
}

function generateReport(mode) {
  const timestamp = new Date().toISOString();
  const results = PROJECTS.map(analyzeProject);
  
  const report = {
    timestamp,
    mode,
    projects: results,
    summary: {
      totalProjects: results.length,
      healthyProjects: results.filter(r => r.healthScore === '🟢').length,
      totalEntities: results.reduce((sum, r) => sum + Object.values(r.stats).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0), 0),
      monetizationReady: results.filter(r => r.monetization.pro).length
    },
    recommendations: []
  };
  
  // Generate recommendations
  for (const r of results) {
    if (r.lastCollection === 'never' || new Date(r.lastCollection) < new Date(Date.now() - 7 * 86400000)) {
      report.recommendations.push(`⚠️ ${r.name}: 数据采集超过7天未运行，需检查cron任务`);
    }
    if (r.controversies > 5) {
      report.recommendations.push(`📋 ${r.name}: ${r.controversies}条争议待解决，建议人工核查`);
    }
  }
  
  if (mode === 'monthly') {
    report.recommendations.push('💡 月度建议：评估新知识库方向，优化变现策略');
  }
  
  // Save report
  const reportFile = path.join(REPORTS_DIR, `report_${timestamp.split('T')[0]}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log(`📊 Performance Report [${mode}] - ${timestamp.split('T')[0]}`);
  console.log(`   Projects: ${report.summary.totalProjects} (${report.summary.healthyProjects} healthy)`);
  console.log(`   Total entities: ${report.summary.totalEntities}`);
  for (const r of results) {
    console.log(`   ${r.healthScore} ${r.name} (${r.domain}): ${JSON.stringify(r.stats)}`);
  }
  for (const rec of report.recommendations) {
    console.log(`   ${rec}`);
  }
  console.log(`   Report saved: ${reportFile}`);
}

const mode = process.argv[2] || 'weekly';
generateReport(mode);
