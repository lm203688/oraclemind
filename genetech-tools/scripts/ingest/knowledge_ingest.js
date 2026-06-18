/**
 * 入库主流程
 * 将验证后的实体写入知识库各JSON文件
 * 
 * 入库规则：
 * 1. 去重：同一基因+疾病+疗法类型视为同一实体，合并而非重复
 * 2. 合并：新数据补充旧数据，不覆盖已有高置信度字段
 * 3. 溯源：每次变更记录到changelog
 * 4. 关系：自动建立实体间关系
 */

const fs = require('fs');
const path = require('path');

const KB_PATH = path.join(__dirname, '../../knowledge-base');
const GENES_PATH = path.join(KB_PATH, 'entities/genes.json');
const DISEASES_PATH = path.join(KB_PATH, 'entities/diseases.json');
const GENE_THERAPIES_PATH = path.join(KB_PATH, 'entities/gene_therapies.json');
const CRISPR_PATH = path.join(KB_PATH, 'entities/crispr_applications.json');
const RELATIONS_PATH = path.join(KB_PATH, 'relations/relations.json');
const CHANGELOG_PATH = path.join(KB_PATH, 'changelog/changelog.json');

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * 生成实体ID
 */
function generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * 判断两个基因疗法实体是否相同
 */
function isSameGeneTherapy(existing, newEntity) {
  const sameGene = existing.target_genes?.some(g => newEntity.genes?.includes(g)) || 
                   existing.target_gene === newEntity.genes?.[0];
  const sameDisease = existing.target_diseases?.some(d => newEntity.diseases?.includes(d)) ||
                      existing.target_disease === newEntity.diseases?.[0];
  const sameTherapy = existing.therapy_type && newEntity.therapy_types?.includes(existing.therapy_type);
  
  return (sameGene && sameDisease) || (sameGene && sameTherapy);
}

/**
 * 合并实体（新数据补充旧数据）
 */
function mergeEntity(existing, newEntity) {
  const merged = { ...existing };
  
  // 数组字段：合并去重
  for (const field of ['target_genes', 'target_diseases', 'companies', 'vectors', 'key_findings']) {
    const existingArr = merged[field] || [];
    const newArr = newEntity[field] || [];
    merged[field] = [...new Set([...existingArr, ...newArr])];
  }
  
  // 开发阶段：取更新的（如果有矛盾，保留置信度更高的）
  if (newEntity.development_stage && newEntity.development_stage !== existing.development_stage) {
    const stageOrder = { 'preclinical': 0, 'phase1': 1, 'phase2': 2, 'phase3': 3, 'approved': 4 };
    if ((stageOrder[newEntity.development_stage] || 0) > (stageOrder[existing.development_stage] || 0)) {
      merged.development_stage = newEntity.development_stage;
      merged.development_stage_updated_at = newEntity.validated_at;
    }
  }
  
  // 来源：合并
  merged.sources = [...(merged.sources || []), ...(newEntity.sources || [])];
  
  // 置信度：取更高的
  if (newEntity.confidence?.score > (merged.confidence?.score || 0)) {
    merged.confidence = newEntity.confidence;
  }
  
  merged.last_updated = newEntity.validated_at || new Date().toISOString();
  
  return merged;
}

/**
 * 将验证后的实体分类入库
 */
async function ingest(validatedEntities) {
  console.log('📥 入库流程启动...');
  
  const genes = loadJson(GENES_PATH);
  const diseases = loadJson(DISEASES_PATH);
  const geneTherapies = loadJson(GENE_THERAPIES_PATH);
  const crispr = loadJson(CRISPR_PATH);
  const relations = loadJson(RELATIONS_PATH);
  const changelog = loadJson(CHANGELOG_PATH);
  
  const changes = {
    genes_added: 0,
    genes_updated: 0,
    diseases_added: 0,
    diseases_updated: 0,
    therapies_added: 0,
    therapies_updated: 0,
    relations_added: 0
  };
  
  for (const entity of validatedEntities) {
    // === 1. 基因实体 ===
    for (const geneSymbol of (entity.genes || [])) {
      const existingGene = genes.entities.find(g => g.symbol === geneSymbol);
      if (!existingGene) {
        genes.entities.push({
          id: generateId('GENE'),
          symbol: geneSymbol,
          first_seen: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          source_count: 1,
          confidence: entity.confidence?.level || 'low'
        });
        changes.genes_added++;
      } else {
        existingGene.source_count = (existingGene.source_count || 0) + 1;
        existingGene.last_updated = new Date().toISOString();
        if (entity.confidence?.level === 'high') existingGene.confidence = 'high';
        changes.genes_updated++;
      }
    }
    
    // === 2. 疾病实体 ===
    for (const diseaseName of (entity.diseases || [])) {
      const existingDisease = diseases.entities.find(d => d.name === diseaseName);
      if (!existingDisease) {
        diseases.entities.push({
          id: generateId('DIS'),
          name: diseaseName,
          first_seen: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          source_count: 1,
          confidence: entity.confidence?.level || 'low'
        });
        changes.diseases_added++;
      } else {
        existingDisease.source_count = (existingDisease.source_count || 0) + 1;
        existingDisease.last_updated = new Date().toISOString();
        changes.diseases_updated++;
      }
    }
    
    // === 3. 基因疗法实体 ===
    const hasTherapyTypes = entity.therapy_types?.some(t => 
      t.toLowerCase().includes('gene therapy') || 
      t.toLowerCase().includes('aav') ||
      t.toLowerCase().includes('gene replacement') ||
      t.toLowerCase().includes('mRNA') ||
      t.toLowerCase().includes('antisense') ||
      t.toLowerCase().includes('lentiviral')
    );
    
    const hasCRISPR = entity.therapy_types?.some(t => 
      t.toLowerCase().includes('crispr') || 
      t.toLowerCase().includes('gene editing') ||
      t.toLowerCase().includes('base editing') ||
      t.toLowerCase().includes('prime editing')
    );
    
    if (hasTherapyTypes) {
      const existing = geneTherapies.entities.find(t => isSameGeneTherapy(t, entity));
      if (!existing) {
        geneTherapies.entities.push({
          id: generateId('GT'),
          target_genes: entity.genes || [],
          target_diseases: entity.diseases || [],
          therapy_type: entity.therapy_types?.[0] || 'unknown',
          therapy_types: entity.therapy_types || [],
          development_stage: entity.development_stage || 'unknown',
          companies: entity.companies || [],
          vectors: entity.vectors || [],
          key_findings: entity.key_findings || [],
          sources: entity.sources || [],
          confidence: entity.confidence || { level: 'low', score: 0 },
          first_seen: new Date().toISOString(),
          last_updated: new Date().toISOString()
        });
        changes.therapies_added++;
      } else {
        const idx = geneTherapies.entities.indexOf(existing);
        geneTherapies.entities[idx] = mergeEntity(existing, entity);
        changes.therapies_updated++;
      }
    }
    
    if (hasCRISPR) {
      const existing = crispr.entities.find(t => isSameGeneTherapy(t, entity));
      if (!existing) {
        crispr.entities.push({
          id: generateId('CR'),
          target_genes: entity.genes || [],
          target_diseases: entity.diseases || [],
          editing_type: entity.therapy_types?.find(t => 
            t.toLowerCase().includes('crispr') || t.toLowerCase().includes('base editing') || t.toLowerCase().includes('prime editing')
          ) || 'CRISPR',
          development_stage: entity.development_stage || 'unknown',
          companies: entity.companies || [],
          key_findings: entity.key_findings || [],
          sources: entity.sources || [],
          confidence: entity.confidence || { level: 'low', score: 0 },
          first_seen: new Date().toISOString(),
          last_updated: new Date().toISOString()
        });
        changes.therapies_added++;
      } else {
        const idx = crispr.entities.indexOf(existing);
        crispr.entities[idx] = mergeEntity(existing, entity);
        changes.therapies_updated++;
      }
    }
    
    // === 4. 关系 ===
    // 基因-疾病关系
    for (const gene of (entity.genes || [])) {
      for (const disease of (entity.diseases || [])) {
        const existingRel = relations.relations.find(r => 
          r.from_entity === gene && r.to_entity === disease && r.relation_type === 'targets'
        );
        if (!existingRel) {
          relations.relations.push({
            id: generateId('REL'),
            from_entity: gene,
            from_type: 'gene',
            to_entity: disease,
            to_type: 'disease',
            relation_type: 'targets',
            confidence: entity.confidence?.level || 'low',
            sources: entity.sources?.length || 1,
            first_seen: new Date().toISOString(),
            last_updated: new Date().toISOString()
          });
          changes.relations_added++;
        }
      }
    }
    
    // 基因-疗法关系
    for (const gene of (entity.genes || [])) {
      for (const therapy of (entity.therapy_types || [])) {
        const existingRel = relations.relations.find(r => 
          r.from_entity === gene && r.to_entity === therapy && r.relation_type === 'treated_by'
        );
        if (!existingRel) {
          relations.relations.push({
            id: generateId('REL'),
            from_entity: gene,
            from_type: 'gene',
            to_entity: therapy,
            to_type: 'therapy',
            relation_type: 'treated_by',
            confidence: entity.confidence?.level || 'low',
            sources: entity.sources?.length || 1,
            first_seen: new Date().toISOString(),
            last_updated: new Date().toISOString()
          });
          changes.relations_added++;
        }
      }
    }
  }
  
  // === 5. 保存所有知识库文件 ===
  const now = new Date().toISOString();
  
  genes.last_updated = now;
  diseases.last_updated = now;
  geneTherapies.last_updated = now;
  crispr.last_updated = now;
  relations.last_updated = now;
  
  saveJson(GENES_PATH, genes);
  saveJson(DISEASES_PATH, diseases);
  saveJson(GENE_THERAPIES_PATH, geneTherapies);
  saveJson(CRISPR_PATH, crispr);
  saveJson(RELATIONS_PATH, relations);
  
  // === 6. 记录变更日志 ===
  changelog.entries.push({
    timestamp: now,
    type: 'ingest',
    changes: changes,
    entity_count: validatedEntities.length,
    summary: `入库${validatedEntities.length}条实体: +${changes.genes_added}基因, +${changes.diseases_added}疾病, +${changes.therapies_added}疗法, +${changes.relations_added}关系`
  });
  changelog.last_updated = now;
  saveJson(CHANGELOG_PATH, changelog);
  
  console.log(`✅ 入库完成:`);
  console.log(`   基因: +${changes.genes_added} 新增, ${changes.genes_updated} 更新`);
  console.log(`   疾病: +${changes.diseases_added} 新增, ${changes.diseases_updated} 更新`);
  console.log(`   疗法: +${changes.therapies_added} 新增, ${changes.therapies_updated} 更新`);
  console.log(`   关系: +${changes.relations_added} 新增`);
  
  return changes;
}

if (require.main === module) {
  ingest([]).catch(console.error);
}

module.exports = { ingest, mergeEntity, isSameGeneTherapy };
