/**
 * 交叉验证器
 * 核心模块：对采集到的原始数据进行多源交叉验证
 * 
 * 验证规则：
 * 1. 同一事实需要2+独立来源 → 置信度high
 * 2. 单一来源但来源等级A → 置信度medium
 * 3. 单一来源且来源等级B以下 → 置信度low
 * 4. 多源矛盾 → 标记争议，降级置信度
 */

const fs = require('fs');
const path = require('path');

const NODE_PATH = '/home/z/.bun/install/global/node_modules';

const KB_PATH = path.join(__dirname, '../../knowledge-base');
const SOURCES_PATH = path.join(KB_PATH, 'sources/sources.json');
const CONTROVERSIES_PATH = path.join(KB_PATH, 'controversies/controversies.json');
const CONFIDENCE_PATH = path.join(KB_PATH, 'metadata/confidence_scores.json');
const AUDIT_QUEUE_PATH = path.join(KB_PATH, 'audit/audit_queue.json');
const CONFIG_PATH = path.join(__dirname, '../../config/audit_rules.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * 来源可信度等级
 */
const SOURCE_CREDIBILITY = {
  'peer_reviewed': 'A',      // PubMed论文
  'clinical_trial': 'A',     // ClinicalTrials.gov
  'regulatory': 'A',         // FDA/EMA官方
  'news_A': 'B',             // Nature News, Science News
  'news_B': 'C',             // 一般科技媒体
  'preprint': 'C',           // arXiv/bioRxiv预印本
  'company_report': 'C',     // 公司新闻稿
  'social_media': 'D'        // 社交媒体
};

/**
 * 对比两个实体是否描述同一事实
 */
function isSameFact(entity1, entity2) {
  // 基因+疾病+疗法类型相同 → 认为描述同一事实
  const sameGene = entity1.genes?.some(g => entity2.genes?.includes(g));
  const sameDisease = entity1.diseases?.some(d => entity2.diseases?.includes(d));
  const sameTherapy = entity1.therapy_types?.some(t => entity2.therapy_types?.includes(t));
  
  return (sameGene && sameDisease) || (sameGene && sameTherapy) || (sameDisease && sameTherapy);
}

/**
 * 检测矛盾
 */
function detectContradictions(entity1, entity2) {
  const contradictions = [];
  
  // 开发阶段矛盾
  if (entity1.development_stage && entity2.development_stage) {
    const stageOrder = { 'preclinical': 0, 'phase1': 1, 'phase2': 2, 'phase3': 3, 'approved': 4 };
    const diff = Math.abs((stageOrder[entity1.development_stage] || 0) - (stageOrder[entity2.development_stage] || 0));
    if (diff >= 2) {
      contradictions.push({
        field: 'development_stage',
        value1: entity1.development_stage,
        value2: entity2.development_stage,
        severity: 'high'
      });
    }
  }
  
  // 疗效数据矛盾
  if (entity1.efficacy_data && entity2.efficacy_data) {
    // 简单的数值差异检测
    contradictions.push({
      field: 'efficacy_data',
      value1: JSON.stringify(entity1.efficacy_data),
      value2: JSON.stringify(entity2.efficacy_data),
      severity: 'medium',
      note: '需要人工判断是否为不同实验条件下的结果'
    });
  }
  
  return contradictions;
}

/**
 * 计算置信度
 */
function calculateConfidence(sources, contradictions) {
  const config = loadJson(CONFIG_PATH);
  
  // 基础分：来源数量
  let score = 0;
  const sourceGrades = sources.map(s => SOURCE_CREDIBILITY[s.source_type] || 'C');
  
  if (sourceGrades.includes('A')) score += 40;
  if (sourceGrades.filter(g => g === 'A').length >= 2) score += 20; // 2个A级来源加分
  if (sourceGrades.includes('B')) score += 20;
  if (sourceGrades.includes('C')) score += 10;
  
  // 来源数量加分
  score += Math.min(sources.length * 5, 20);
  
  // 矛盾扣分
  for (const c of contradictions) {
    if (c.severity === 'high') score -= 30;
    if (c.severity === 'medium') score -= 15;
    if (c.severity === 'low') score -= 5;
  }
  
  // 映射到等级
  score = Math.max(0, Math.min(100, score));
  
  if (score >= 70) return { level: 'high', score };
  if (score >= 40) return { level: 'medium', score };
  return { level: 'low', score };
}

/**
 * 主验证流程
 * @param {Array} rawEntities - 从采集器输出的原始实体列表
 * @param {Object} existingKnowledge - 现有知识库（用于与已有知识交叉验证）
 */
async function validate(rawEntities, existingKnowledge) {
  console.log('🔍 交叉验证器启动...');
  
  const sources = loadJson(SOURCES_PATH);
  const controversies = loadJson(CONTROVERSIES_PATH);
  const confidence = loadJson(CONFIDENCE_PATH);
  const auditQueue = loadJson(AUDIT_QUEUE_PATH);
  
  const validatedEntities = [];
  const newControversies = [];
  const newAuditItems = [];
  
  // 1. 按事实分组（描述同一事物的实体归为一组）
  const factGroups = [];
  const assigned = new Set();
  
  for (let i = 0; i < rawEntities.length; i++) {
    if (assigned.has(i)) continue;
    
    const group = { entities: [rawEntities[i]], indices: [i] };
    assigned.add(i);
    
    for (let j = i + 1; j < rawEntities.length; j++) {
      if (assigned.has(j)) continue;
      if (isSameFact(rawEntities[i], rawEntities[j])) {
        group.entities.push(rawEntities[j]);
        group.indices.push(j);
        assigned.add(j);
      }
    }
    
    factGroups.push(group);
  }
  
  console.log(`📊 分为${factGroups.length}个事实组`);
  
  // 2. 对每组进行验证
  for (const group of factGroups) {
    const entities = group.entities;
    
    // 收集所有来源
    const groupSources = entities.map(e => ({
      source_type: e.source_type || e.source || 'unknown',
      source_credibility: e.source_credibility || SOURCE_CREDIBILITY[e.source_type] || 'C',
      paper_pmid: e.paper_pmid,
      article_url: e.article_url,
      collected_at: e.collected_at || e.extracted_at
    }));
    
    // 检测组内矛盾
    let groupContradictions = [];
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const contradictions = detectContradictions(entities[i], entities[j]);
        groupContradictions.push(...contradictions);
      }
    }
    
    // 计算置信度
    const confidenceResult = calculateConfidence(groupSources, groupContradictions);
    
    // 合并为一个验证后的实体
    const mergedEntity = {
      // 取最完整的字段
      genes: [...new Set(entities.flatMap(e => e.genes || []))],
      diseases: [...new Set(entities.flatMap(e => e.diseases || []))],
      therapy_types: [...new Set(entities.flatMap(e => e.therapy_types || []))],
      companies: [...new Set(entities.flatMap(e => e.companies || []))],
      vectors: [...new Set(entities.flatMap(e => e.vectors || []))],
      
      // 开发阶段取最高（如果有矛盾则标记）
      development_stage: entities.reduce((best, e) => {
        const stageOrder = { 'preclinical': 0, 'phase1': 1, 'phase2': 2, 'phase3': 3, 'approved': 4 };
        return (stageOrder[e.development_stage] || 0) > (stageOrder[best] || 0) ? e.development_stage : best;
      }, 'preclinical'),
      
      // 关键发现合并
      key_findings: [...new Set(entities.flatMap(e => e.key_findings || []))],
      
      // 元数据
      sources: groupSources,
      confidence: confidenceResult,
      validated_at: new Date().toISOString(),
      validation_version: '1.0'
    };
    
    // 处理矛盾
    if (groupContradictions.length > 0) {
      // 记录争议
      const controversy = {
        id: `CTR-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        entity_genes: mergedEntity.genes,
        entity_diseases: mergedEntity.diseases,
        contradictions: groupContradictions,
        detected_at: new Date().toISOString(),
        status: 'unresolved',
        resolution: null
      };
      newControversies.push(controversy);
      
      // 如果矛盾严重，加入人工审核队列
      if (groupContradictions.some(c => c.severity === 'high')) {
        newAuditItems.push({
          id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'contradiction',
          entity: mergedEntity,
          controversy_id: controversy.id,
          priority: 'high',
          created_at: new Date().toISOString(),
          status: 'pending'
        });
      }
    }
    
    // 与现有知识库交叉验证
    if (existingKnowledge) {
      const existingEntities = [
        ...(existingKnowledge.gene_therapies || []),
        ...(existingKnowledge.crispr_applications || [])
      ];
      
      for (const existing of existingEntities) {
        if (isSameFact(mergedEntity, existing)) {
          // 检查是否与已有知识矛盾
          const contradictions = detectContradictions(mergedEntity, existing);
          if (contradictions.length > 0) {
            // 新知识推翻旧知识 → 加入审核队列
            newAuditItems.push({
              id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              type: 'knowledge_overturn',
              new_entity: mergedEntity,
              existing_entity: existing,
              contradictions: contradictions,
              priority: 'high',
              created_at: new Date().toISOString(),
              status: 'pending'
            });
          } else {
            // 一致 → 提升置信度
            mergedEntity.confidence.score = Math.min(100, mergedEntity.confidence.score + 10);
            if (mergedEntity.confidence.score >= 70) {
              mergedEntity.confidence.level = 'high';
            }
          }
        }
      }
    }
    
    validatedEntities.push(mergedEntity);
  }
  
  // 3. 更新争议库
  controversies.controversies.push(...newControversies);
  controversies.last_updated = new Date().toISOString();
  saveJson(CONTROVERSIES_PATH, controversies);
  
  // 4. 更新审核队列
  auditQueue.queue.push(...newAuditItems);
  saveJson(AUDIT_QUEUE_PATH, auditQueue);
  
  // 5. 更新来源库
  for (const entity of validatedEntities) {
    for (const src of entity.sources) {
      const existingSource = sources.sources.find(s => 
        s.paper_pmid === src.paper_pmid || s.article_url === src.article_url
      );
      if (!existingSource) {
        sources.sources.push({
          ...src,
          added_at: new Date().toISOString()
        });
      }
    }
  }
  sources.last_updated = new Date().toISOString();
  saveJson(SOURCES_PATH, sources);
  
  // 6. 更新置信度
  for (const entity of validatedEntities) {
    const key = entity.genes.join('+') + '|' + entity.diseases.join('+');
    confidence.scores[key] = {
      level: entity.confidence.level,
      score: entity.confidence.score,
      source_count: entity.sources.length,
      last_validated: new Date().toISOString()
    };
  }
  confidence.last_updated = new Date().toISOString();
  saveJson(CONFIDENCE_PATH, confidence);
  
  console.log(`✅ 验证完成: ${validatedEntities.length}条实体`);
  console.log(`   置信度分布: high=${validatedEntities.filter(e => e.confidence.level === 'high').length}, medium=${validatedEntities.filter(e => e.confidence.level === 'medium').length}, low=${validatedEntities.filter(e => e.confidence.level === 'low').length}`);
  console.log(`   新争议: ${newControversies.length}条`);
  console.log(`   待审核: ${newAuditItems.length}条`);
  
  return {
    validatedEntities,
    newControversies,
    newAuditItems
  };
}

if (require.main === module) {
  // 测试：用空数据运行
  validate([], null).catch(console.error);
}

module.exports = { validate, isSameFact, detectContradictions, calculateConfidence };
