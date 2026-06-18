/**
 * 每周深度核查脚本
 * 
 * 每周执行，检查：
 * 1. 知识完整性：每个疗法实体是否有完整的字段
 * 2. 关系网络：关系图是否有断裂
 * 3. 争议追踪：未解决的争议是否需要升级
 * 4. 数据新鲜度：哪些领域很久没有新数据了
 * 5. 重复检测：是否有重复实体
 * 6. 生成每周报告
 */

const fs = require('fs');
const path = require('path');

const KB_PATH = path.join(__dirname, '../../knowledge-base');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * 知识完整性检查
 * 每个疗法实体应该有：target_genes, target_diseases, therapy_type, development_stage, sources
 */
function checkCompleteness() {
  console.log('📐 知识完整性检查...');
  
  const issues = [];
  
  for (const entityFile of ['gene_therapies.json', 'crispr_applications.json']) {
    const data = loadJson(path.join(KB_PATH, 'entities', entityFile));
    
    for (const entity of data.entities) {
      const missing = [];
      
      if (!(entity.target_genes || entity.genes || []).length) missing.push('target_genes');
      if (!(entity.target_diseases || entity.diseases || []).length) missing.push('target_diseases');
      if (!entity.therapy_type && !entity.editing_type) missing.push('therapy_type');
      if (!entity.development_stage) missing.push('development_stage');
      if (!(entity.sources || []).length) missing.push('sources');
      if (!entity.confidence) missing.push('confidence');
      
      if (missing.length > 0) {
        issues.push({
          entity_id: entity.id,
          entity_file: entityFile,
          missing_fields: missing,
          severity: missing.length >= 3 ? 'high' : 'medium'
        });
      }
    }
  }
  
  console.log(`   发现${issues.length}个不完整实体`);
  return issues;
}

/**
 * 关系网络检查
 * 检测断裂的关系（指向不存在的实体）
 */
function checkRelationIntegrity() {
  console.log('🔗 关系网络完整性检查...');
  
  const relations = loadJson(path.join(KB_PATH, 'relations/relations.json'));
  const genes = loadJson(path.join(KB_PATH, 'entities/genes.json'));
  const diseases = loadJson(path.join(KB_PATH, 'entities/diseases.json'));
  
  const geneSymbols = new Set(genes.entities.map(g => g.symbol));
  const diseaseNames = new Set(diseases.entities.map(d => d.name));
  
  const brokenRelations = [];
  
  for (const rel of relations.relations) {
    if (rel.from_type === 'gene' && !geneSymbols.has(rel.from_entity)) {
      brokenRelations.push({ relation_id: rel.id, issue: 'from_entity_not_found', entity: rel.from_entity });
    }
    if (rel.to_type === 'disease' && !diseaseNames.has(rel.to_entity)) {
      brokenRelations.push({ relation_id: rel.id, issue: 'to_entity_not_found', entity: rel.to_entity });
    }
  }
  
  console.log(`   发现${brokenRelations.length}条断裂关系`);
  return brokenRelations;
}

/**
 * 争议追踪
 */
function trackControversies() {
  console.log('⚖️ 争议追踪...');
  
  const controversies = loadJson(path.join(KB_PATH, 'controversies/controversies.json'));
  const auditQueue = loadJson(path.join(KB_PATH, 'audit/audit_queue.json'));
  
  const unresolved = controversies.controversies.filter(c => c.status === 'unresolved');
  const aged = unresolved.filter(c => {
    const daysSinceDetected = (Date.now() - new Date(c.detected_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceDetected > 14; // 超过2周未解决
  });
  
  // 老争议升级为高优先级审核
  for (const controversy of aged) {
    const existingAudit = auditQueue.queue.find(q => q.controversy_id === controversy.id);
    if (!existingAudit) {
      auditQueue.queue.push({
        id: `AUD-ESCALATE-${Date.now()}-${controversy.id}`,
        type: 'controversy_escalation',
        controversy_id: controversy.id,
        priority: 'high',
        created_at: new Date().toISOString(),
        status: 'pending',
        note: `争议已存在超过14天未解决，需要审核`
      });
    }
  }
  
  saveJson(path.join(KB_PATH, 'audit/audit_queue.json'), auditQueue);
  
  console.log(`   未解决争议: ${unresolved.length}条, 其中${aged.length}条超过14天`);
  return { unresolved: unresolved.length, aged: aged.length };
}

/**
 * 数据新鲜度检查
 * 哪些领域很久没有新数据了
 */
function checkDataFreshness() {
  console.log(' freshness 数据新鲜度检查...');
  
  const geneTherapies = loadJson(path.join(KB_PATH, 'entities/gene_therapies.json'));
  const crispr = loadJson(path.join(KB_PATH, 'entities/crispr_applications.json'));
  
  const staleAreas = [];
  
  for (const entity of [...geneTherapies.entities, ...crispr.entities]) {
    const lastUpdated = new Date(entity.last_updated).getTime();
    const daysSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate > 90) {
      staleAreas.push({
        entity_id: entity.id,
        genes: entity.target_genes || entity.genes || [],
        diseases: entity.target_diseases || entity.diseases || [],
        days_stale: Math.round(daysSinceUpdate),
        priority: daysSinceUpdate > 180 ? 'high' : 'medium'
      });
    }
  }
  
  console.log(`   发现${staleAreas.length}个过时领域`);
  return staleAreas;
}

/**
 * 重复实体检测
 */
function detectDuplicates() {
  console.log('🔄 重复实体检测...');
  
  const duplicates = [];
  
  for (const entityFile of ['gene_therapies.json', 'crispr_applications.json']) {
    const data = loadJson(path.join(KB_PATH, 'entities', entityFile));
    
    for (let i = 0; i < data.entities.length; i++) {
      for (let j = i + 1; j < data.entities.length; j++) {
        const e1 = data.entities[i];
        const e2 = data.entities[j];
        
        const sameGenes = (e1.target_genes || []).sort().join(',') === (e2.target_genes || []).sort().join(',');
        const sameDiseases = (e1.target_diseases || []).sort().join(',') === (e2.target_diseases || []).sort().join(',');
        const sameTherapy = (e1.therapy_type || e1.editing_type) === (e2.therapy_type || e2.editing_type);
        
        if (sameGenes && sameDiseases && sameTherapy) {
          duplicates.push({
            entity_file: entityFile,
            entity1_id: e1.id,
            entity2_id: e2.id,
            genes: e1.target_genes || e1.genes,
            diseases: e1.target_diseases || e1.diseases,
            action: 'merge_needed'
          });
        }
      }
    }
  }
  
  console.log(`   发现${duplicates.length}对重复实体`);
  return duplicates;
}

/**
 * 生成每周报告
 */
function generateWeeklyReport(results) {
  const now = new Date();
  const weekNumber = Math.ceil((now.getDate()) / 7);
  const timestamp = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  
  const report = {
    period: timestamp,
    generated_at: now.toISOString(),
    summary: {
      incomplete_entities: results.completeness?.length || 0,
      broken_relations: results.relations?.length || 0,
      unresolved_controversies: results.controversies?.unresolved || 0,
      aged_controversies: results.controversies?.aged || 0,
      stale_areas: results.freshness?.length || 0,
      duplicate_pairs: results.duplicates?.length || 0
    },
    knowledge_base_stats: {
      genes: loadJson(path.join(KB_PATH, 'entities/genes.json')).entities.length,
      diseases: loadJson(path.join(KB_PATH, 'entities/diseases.json')).entities.length,
      gene_therapies: loadJson(path.join(KB_PATH, 'entities/gene_therapies.json')).entities.length,
      crispr_applications: loadJson(path.join(KB_PATH, 'entities/crispr_applications.json')).entities.length,
      relations: loadJson(path.join(KB_PATH, 'relations/relations.json')).relations.length,
      sources: loadJson(path.join(KB_PATH, 'sources/sources.json')).sources.length,
      controversies: loadJson(path.join(KB_PATH, 'controversies/controversies.json')).controversies.length,
      pending_audits: loadJson(path.join(KB_PATH, 'audit/audit_queue.json')).queue.filter(q => q.status === 'pending').length
    },
    details: results,
    recommendations: []
  };
  
  // 生成建议
  if (results.completeness?.length > 0) {
    report.recommendations.push(`有${results.completeness.length}个实体字段不完整，需要补充数据`);
  }
  if (results.duplicates?.length > 0) {
    report.recommendations.push(`有${results.duplicates.length}对重复实体需要合并`);
  }
  if (results.freshness?.length > 0) {
    report.recommendations.push(`有${results.freshness.length}个领域数据过时，需要重新采集`);
  }
  if (results.controversies?.aged > 0) {
    report.recommendations.push(`有${results.controversies.aged}个争议超过14天未解决，需要优先处理`);
  }
  
  const reportPath = path.join(KB_PATH, 'audit/weekly_reports', `report_${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📊 每周报告已保存: ${reportPath}`);
  return report;
}

/**
 * 主流程
 */
async function runWeeklyAudit() {
  console.log('🔍 ========== 每周深度核查启动 ==========');
  console.log(`📅 ${new Date().toISOString()}`);
  
  const results = {};
  
  results.completeness = checkCompleteness();
  results.relations = checkRelationIntegrity();
  results.controversies = trackControversies();
  results.freshness = checkDataFreshness();
  results.duplicates = detectDuplicates();
  
  const report = generateWeeklyReport(results);
  
  console.log('✅ ========== 每周深度核查完成 ==========');
  if (report.recommendations.length > 0) {
    console.log('📋 建议:');
    report.recommendations.forEach((r, i) => console.log(`   ${i + 1}. ${r}`));
  }
  
  return report;
}

if (require.main === module) {
  runWeeklyAudit().catch(console.error);
}

module.exports = { runWeeklyAudit };
