/**
 * 知识引擎主流程编排
 * 
 * 完整Pipeline: 采集 → 验证 → 入库 → 核查
 * 
 * 用法:
 *   node pipeline.js --mode=daily     # 每日完整流程
 *   node pipeline.js --mode=collect   # 仅采集
 *   node pipeline.js --mode=validate  # 仅验证+入库
 *   node pipeline.js --mode=audit     # 仅核查
 *   node pipeline.js --mode=weekly    # 每周深度核查
 *   node pipeline.js --mode=backfill  # 从已有raw数据回填（提取+验证+入库）
 *   node pipeline.js --mode=full      # 采集+回填+验证+入库+周核查（全量刷新）
 */

const fs = require('fs');
const path = require('path');

const KB_PATH = path.join(__dirname, '../knowledge-base');
const RAW_DIR = path.join(KB_PATH, 'raw');

// 导入各模块
const { runCollection: runPubMed } = require('./collect/pubmed_collector');
const { runCollection: runNews } = require('./collect/news_collector');
const { runCollection: runClinicalTrials } = require('./collect/clinical_trials');
const { validate } = require('./validate/cross_validator');
const { ingest } = require('./ingest/knowledge_ingest');
const { runDailyAudit } = require('./audit/daily_audit');
const { runWeeklyAudit } = require('./audit/weekly_audit');

function parseArgs() {
  const args = process.argv.slice(2);
  const mode = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'daily';
  return { mode };
}

/**
 * 采集阶段
 */
async function collect() {
  console.log('\n📡 ========== 采集阶段 ==========\n');
  
  const results = {};
  
  // 并行采集（各源独立）
  const [pubmedResult, newsResult, ctResult] = await Promise.allSettled([
    runPubMed(),
    runNews(),
    runClinicalTrials()
  ]);
  
  results.pubmed = pubmedResult.status === 'fulfilled' ? pubmedResult.value : { error: pubmedResult.reason?.message };
  results.news = newsResult.status === 'fulfilled' ? newsResult.value : { error: newsResult.reason?.message };
  results.clinical_trials = ctResult.status === 'fulfilled' ? ctResult.value : { error: ctResult.reason?.message };
  
  return results;
}

/**
 * 验证+入库阶段
 */
async function validateAndIngest(collectResults) {
  console.log('\n🔬 ========== 验证+入库阶段 ==========\n');
  
  // 1. 合并所有采集源的实体
  const allEntities = [];
  
  for (const [source, result] of Object.entries(collectResults)) {
    if (result.error) {
      console.log(`⚠️ ${source}采集失败: ${result.error}`);
      continue;
    }
    
    const entities = result.entities || [];
    for (const entity of entities) {
      entity._source_type = source; // 标记来源类型
    }
    allEntities.push(...entities);
  }
  
  console.log(`📊 待验证实体总数: ${allEntities.length}`);
  
  if (allEntities.length === 0) {
    console.log('⚠️ 没有新实体需要验证');
    return { validated: 0, ingested: 0 };
  }
  
  // 2. 交叉验证
  const validationResult = await validate(allEntities, collectResults);
  
  // 3. 入库
  const ingestResult = await ingest(validationResult.validatedEntities);
  
  return {
    validated: validationResult.validatedEntities.length,
    controversies: validationResult.newControversies.length,
    auditItems: validationResult.newAuditItems.length,
    ingested: Object.values(ingestResult).reduce((sum, v) => sum + v, 0)
  };
}

/**
 * 核查阶段
 */
async function audit(mode) {
  console.log('\n🔍 ========== 核查阶段 ==========\n');
  
  if (mode === 'weekly') {
    return await runWeeklyAudit();
  }
  return await runDailyAudit();
}

/**
 * 每日完整流程
 */
async function runDaily() {
  const startTime = Date.now();
  console.log('🚀 ========== 知识引擎每日流程启动 ==========');
  console.log(`📅 ${new Date().toISOString()}\n`);
  
  // 阶段1: 采集
  const collectResults = await collect();
  
  // 阶段2: 验证+入库
  const processResults = await validateAndIngest(collectResults);
  
  // 阶段3: 每日核查
  const auditResult = await audit('daily');
  
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  console.log('\n🏁 ========== 知识引擎每日流程完成 ==========');
  console.log(`⏱️ 总耗时: ${duration}分钟`);
  console.log(`📊 今日统计:`);
  console.log(`   验证通过: ${processResults.validated}条`);
  console.log(`   新争议: ${processResults.controversies}条`);
  console.log(`   待审核: ${processResults.auditItems}条`);
  console.log(`   入库变更: ${processResults.ingested}处`);
  console.log(`   知识库总量: ${auditResult.knowledge_base_stats?.genes || 0}基因, ${auditResult.knowledge_base_stats?.diseases || 0}疾病, ${auditResult.knowledge_base_stats?.gene_therapies || 0}疗法`);
  
  return {
    collect: collectResults,
    process: processResults,
    audit: auditResult,
    duration_minutes: duration
  };
}

/**
 * 主入口
 */
async function main() {
  const { mode } = parseArgs();
  
  try {
    switch (mode) {
      case 'daily':
        await runDaily();
        break;
      case 'collect':
        await collect();
        break;
      case 'validate': {
        // 从最新的raw文件加载数据验证
        const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json')).sort();
        if (rawFiles.length === 0) {
          console.log('⚠️ 没有找到原始采集数据');
          break;
        }
        const latestRaw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, rawFiles[rawFiles.length - 1]), 'utf-8'));
        await validate(latestRaw.entities || [], latestRaw);
        break;
      }
      case 'audit':
        await audit('daily');
        break;
      case 'weekly':
        await audit('weekly');
        break;
      case 'backfill': {
        const { execSync } = require('child_process');
        const maxEntities = args.find(a => a.startsWith('--max='))?.split('=')[1] || '30';
        const source = args.find(a => a.startsWith('--source='))?.split('=')[1] || '';
        const dryRun = args.includes('--dry-run');
        let cmd = `node ${path.join(__dirname, 'backfill.js')} --max=${maxEntities}`;
        if (source) cmd += ` --source=${source}`;
        if (dryRun) cmd += ' --dry-run';
        execSync(cmd, { stdio: 'inherit' });
        break;
      }
      case 'full': {
        // 全量刷新：采集 → 回填 → 周核查
        console.log('🚀 ========== 全量刷新流程 ==========\n');
        // 1. 采集
        const collectResults = await collect();
        // 2. 回填（从已有raw数据提取实体）
        const { execSync } = require('child_process');
        execSync(`node ${path.join(__dirname, 'backfill.js')} --max=30`, { stdio: 'inherit' });
        // 3. 周核查
        await audit('weekly');
        break;
      }
      default:
        console.log(`未知模式: ${mode}`);
        console.log('可用模式: daily, collect, validate, audit, weekly, backfill, full');
    }
  } catch (error) {
    console.error('❌ 流程执行失败:', error);
    process.exit(1);
  }
}

main();
