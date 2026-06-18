/**
 * 每日核查脚本
 * 
 * 每日执行，检查：
 * 1. 来源URL是否仍然有效
 * 2. 置信度衰减（信息过时自动降级）
 * 3. 孤立实体检测（没有关系的实体）
 * 4. 待审核队列处理（自动处理低风险的）
 * 5. 生成每日核查报告
 */

const fs = require('fs');
const path = require('path');

const KB_PATH = path.join(__dirname, '../../knowledge-base');
const CONFIG_PATH = path.join(__dirname, '../../config/audit_rules.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * 置信度衰减
 * 信息越久未更新，置信度越低
 */
function applyConfidenceDecay() {
  console.log('📉 置信度衰减检查...');
  
  const config = loadJson(CONFIG_PATH);
  const confidence = loadJson(path.join(KB_PATH, 'metadata/confidence_scores.json'));
  const now = Date.now();
  let decayed = 0;
  
  for (const [key, scoreData] of Object.entries(confidence.scores)) {
    const lastValidated = new Date(scoreData.last_validated).getTime();
    const daysSinceValidation = (now - lastValidated) / (1000 * 60 * 60 * 24);
    
    let newLevel = scoreData.level;
    
    if (scoreData.level === 'high' && daysSinceValidation > config.confidence_decay.high_to_medium_days) {
      newLevel = 'medium';
      scoreData.score = Math.max(40, scoreData.score - 15);
    }
    
    if (scoreData.level === 'medium' && daysSinceValidation > config.confidence_decay.medium_to_low_days) {
      newLevel = 'low';
      scoreData.score = Math.max(10, scoreData.score - 20);
    }
    
    if (newLevel !== scoreData.level) {
      console.log(`   ⬇️ ${key}: ${scoreData.level} → ${newLevel} (${Math.round(daysSinceValidation)}天未验证)`);
      scoreData.level = newLevel;
      decayed++;
    }
  }
  
  confidence.last_updated = new Date().toISOString();
  saveJson(path.join(KB_PATH, 'metadata/confidence_scores.json'), confidence);
  
  console.log(`   衰减了${decayed}条实体的置信度`);
  return decayed;
}

/**
 * 同步置信度到实体文件
 */
function syncConfidenceToEntities() {
  console.log('🔄 同步置信度到实体文件...');
  
  const confidence = loadJson(path.join(KB_PATH, 'metadata/confidence_scores.json'));
  
  for (const entityFile of ['gene_therapies.json', 'crispr_applications.json']) {
    const filePath = path.join(KB_PATH, 'entities', entityFile);
    const data = loadJson(filePath);
    
    for (const entity of data.entities) {
      const key = (entity.target_genes || []).join('+') + '|' + (entity.target_diseases || []).join('+');
      if (confidence.scores[key]) {
        entity.confidence = confidence.scores[key];
      }
    }
    
    data.last_updated = new Date().toISOString();
    saveJson(filePath, data);
  }
}

/**
 * 孤立实体检测
 * 没有任何关系的实体可能是不完整的
 */
function detectOrphanEntities() {
  console.log('🏝️ 孤立实体检测...');
  
  const relations = loadJson(path.join(KB_PATH, 'relations/relations.json'));
  const genes = loadJson(path.join(KB_PATH, 'entities/genes.json'));
  const diseases = loadJson(path.join(KB_PATH, 'entities/diseases.json'));
  const geneTherapies = loadJson(path.join(KB_PATH, 'entities/gene_therapies.json'));
  
  const relatedEntities = new Set();
  for (const rel of relations.relations) {
    relatedEntities.add(rel.from_entity);
    relatedEntities.add(rel.to_entity);
  }
  
  const orphans = {
    genes: genes.entities.filter(g => !relatedEntities.has(g.symbol)),
    diseases: diseases.entities.filter(d => !relatedEntities.has(d.name)),
    therapies: geneTherapies.entities.filter(t => 
      !(t.target_genes || []).some(g => relatedEntities.has(g)) && 
      !(t.target_diseases || []).some(d => relatedEntities.has(d))
    )
  };
  
  const totalOrphans = orphans.genes.length + orphans.diseases.length + orphans.therapies.length;
  console.log(`   孤立实体: ${orphans.genes.length}基因, ${orphans.diseases.length}疾病, ${orphans.therapies.length}疗法`);
  
  // 孤立实体加入审核队列
  if (totalOrphans > 0) {
    const auditQueue = loadJson(path.join(KB_PATH, 'audit/audit_queue.json'));
    
    for (const gene of orphans.genes) {
      auditQueue.queue.push({
        id: `AUD-ORPHAN-${Date.now()}-${gene.symbol}`,
        type: 'orphan_entity',
        entity_type: 'gene',
        entity_id: gene.id,
        entity_name: gene.symbol,
        priority: 'low',
        created_at: new Date().toISOString(),
        status: 'pending',
        note: '该基因实体没有任何关系，可能需要补充关联信息或标记为不完整'
      });
    }
    
    saveJson(path.join(KB_PATH, 'audit/audit_queue.json'), auditQueue);
  }
  
  return orphans;
}

/**
 * 来源URL有效性检查
 */
async function checkSourceUrls() {
  console.log('🔗 来源URL有效性检查...');
  
  const sources = loadJson(path.join(KB_PATH, 'sources/sources.json'));
  let invalid = 0;
  let checked = 0;
  
  // 只检查最近添加的来源（避免每次检查所有）
  const recentSources = sources.sources.filter(s => {
    const addedDate = new Date(s.added_at).getTime();
    const daysSinceAdded = (Date.now() - addedDate) / (1000 * 60 * 60 * 24);
    return daysSinceAdded < 30; // 只检查30天内添加的
  });
  
  for (const source of recentSources.slice(0, 20)) { // 每次最多检查20个
    if (source.article_url) {
      try {
        const response = await fetch(source.article_url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        source.url_status = response.ok ? 'active' : 'broken';
        if (!response.ok) invalid++;
      } catch (e) {
        source.url_status = 'unreachable';
        invalid++;
      }
      checked++;
    }
  }
  
  sources.last_updated = new Date().toISOString();
  saveJson(path.join(KB_PATH, 'sources/sources.json'), sources);
  
  console.log(`   检查了${checked}个URL, ${invalid}个无效`);
  return { checked, invalid };
}

/**
 * 处理审核队列中的低风险项
 */
function processAuditQueue() {
  console.log('📋 审核队列处理...');
  
  const auditQueue = loadJson(path.join(KB_PATH, 'audit/audit_queue.json'));
  const config = loadJson(CONFIG_PATH);
  
  let autoResolved = 0;
  let pending = 0;
  
  for (const item of auditQueue.queue) {
    if (item.status !== 'pending') continue;
    
    // 低优先级的孤立实体：如果超过30天未处理，自动标记为"需补充"
    if (item.type === 'orphan_entity' && item.priority === 'low') {
      const daysSinceCreated = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated > 30) {
        item.status = 'auto_resolved';
        item.resolution = 'orphan_entity_marked_incomplete';
        item.resolved_at = new Date().toISOString();
        autoResolved++;
        continue;
      }
    }
    
    // 高优先级项保持pending，需要人工或更高级别AI审核
    if (item.priority === 'high') {
      pending++;
      continue;
    }
    
    pending++;
  }
  
  saveJson(path.join(KB_PATH, 'audit/audit_queue.json'), auditQueue);
  
  console.log(`   自动处理: ${autoResolved}条, 待处理: ${pending}条`);
  return { autoResolved, pending };
}

/**
 * 生成每日核查报告
 */
function generateDailyReport(results) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  const report = {
    date: timestamp,
    generated_at: new Date().toISOString(),
    summary: {
      confidence_decayed: results.decayed,
      orphan_entities: results.orphans ? (results.orphans.genes.length + results.orphans.diseases.length + results.orphans.therapies.length) : 0,
      urls_checked: results.urlCheck?.checked || 0,
      urls_invalid: results.urlCheck?.invalid || 0,
      audit_auto_resolved: results.auditProcess?.autoResolved || 0,
      audit_pending: results.auditProcess?.pending || 0
    },
    knowledge_base_stats: {
      genes: loadJson(path.join(KB_PATH, 'entities/genes.json')).entities.length,
      diseases: loadJson(path.join(KB_PATH, 'entities/diseases.json')).entities.length,
      gene_therapies: loadJson(path.join(KB_PATH, 'entities/gene_therapies.json')).entities.length,
      crispr_applications: loadJson(path.join(KB_PATH, 'entities/crispr_applications.json')).entities.length,
      relations: loadJson(path.join(KB_PATH, 'relations/relations.json')).relations.length,
      sources: loadJson(path.join(KB_PATH, 'sources/sources.json')).sources.length,
      controversies: loadJson(path.join(KB_PATH, 'controversies/controversies.json')).controversies.length,
      audit_queue: loadJson(path.join(KB_PATH, 'audit/audit_queue.json')).queue.filter(q => q.status === 'pending').length
    },
    details: results
  };
  
  const reportPath = path.join(KB_PATH, 'audit/daily_reports', `report_${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📊 每日报告已保存: ${reportPath}`);
  return report;
}

/**
 * 主流程
 */
async function runDailyAudit() {
  console.log('🔍 ========== 每日核查启动 ==========');
  console.log(`📅 ${new Date().toISOString()}`);
  
  const results = {};
  
  // 1. 置信度衰减
  results.decayed = applyConfidenceDecay();
  
  // 2. 同步置信度
  syncConfidenceToEntities();
  
  // 3. 孤立实体检测
  results.orphans = detectOrphanEntities();
  
  // 4. 来源URL检查
  results.urlCheck = await checkSourceUrls();
  
  // 5. 审核队列处理
  results.auditProcess = processAuditQueue();
  
  // 6. 生成报告
  const report = generateDailyReport(results);
  
  console.log('✅ ========== 每日核查完成 ==========');
  console.log(`   知识库统计: ${report.knowledge_base_stats.genes}基因, ${report.knowledge_base_stats.diseases}疾病, ${report.knowledge_base_stats.gene_therapies}疗法, ${report.knowledge_base_stats.relations}关系`);
  
  return report;
}

if (require.main === module) {
  runDailyAudit().catch(console.error);
}

module.exports = { runDailyAudit };
