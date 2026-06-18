/**
 * 数据回填脚本
 * 从已有的raw采集数据中提取实体、验证、入库
 * 
 * 用法:
 *   node backfill.js                     # 回填所有raw数据
 *   node backfill.js --source=pubmed     # 仅回填PubMed数据
 *   node backfill.js --source=news       # 仅回填新闻数据
 *   node backfill.js --source=clinical   # 仅回填临床试验数据
 *   node backfill.js --max=50            # 限制提取数量
 *   node backfill.js --dry-run           # 仅提取不入库
 */

const fs = require('fs');
const path = require('path');

const NODE_PATH = '/home/z/.bun/install/global/node_modules';
const KB_PATH = path.join(__dirname, '../knowledge-base');
const RAW_DIR = path.join(KB_PATH, 'raw');

const { validate } = require('./validate/cross_validator');
const { ingest } = require('./ingest/knowledge_ingest');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { source: null, max: 30, dryRun: false };
  for (const arg of args) {
    if (arg.startsWith('--source=')) opts.source = arg.split('=')[1];
    if (arg.startsWith('--max=')) opts.max = parseInt(arg.split('=')[1]);
    if (arg === '--dry-run') opts.dryRun = true;
  }
  return opts;
}

/**
 * 使用LLM从PubMed论文中提取结构化实体
 */
async function extractFromPubMed(paper) {
  if (!paper.abstract || paper.abstract.length < 50) return null;
  
  const prompt = `You are a gene technology knowledge extraction expert. Extract structured entities from this research paper.

Title: ${paper.title}
Abstract: ${paper.abstract.substring(0, 3000)}

Extract the following as JSON:
{
  "genes": ["list of gene symbols mentioned"],
  "diseases": ["list of diseases/conditions mentioned"],
  "therapy_types": ["gene_replacement", "CRISPR_editing", "base_editing", "prime_editing", "RNAi", "CAR-T", "AAV_delivery", "mRNA_therapy", "antisense", "epigenome_editing", "other"],
  "vectors": ["list of viral/non-viral vectors mentioned"],
  "development_stages": ["preclinical", "phase1", "phase2", "phase3", "approved"],
  "key_findings": ["1-3 sentence summary of key findings"],
  "efficacy_data": {"metric": "value if mentioned, e.g. 85% correction rate"},
  "safety_data": {"summary": "brief safety findings if mentioned"},
  "relevance_score": 1-10 (how relevant to gene therapy development)
}

Return ONLY the JSON, no other text.`;

  try {
    const sdk = require(require.resolve('z-ai-web-dev-sdk', { paths: [NODE_PATH] }));
    const ZAI = sdk.default;
    const zai = await ZAI.create();
    const result = await zai.createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });
    
    const content = result.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error(`  提取失败 [PMID:${paper.pmid}]:`, error.message);
    return null;
  }
}

/**
 * 使用LLM从临床试验中提取结构化实体
 */
async function extractFromClinicalTrial(trial) {
  const text = `${trial.title}. ${trial.brief_summary || ''} Conditions: ${(trial.conditions || []).join(', ')}`;
  if (text.length < 30) return null;
  
  const prompt = `You are a gene technology knowledge extraction expert. Extract structured entities from this clinical trial.

Title: ${trial.title}
Summary: ${(trial.brief_summary || '').substring(0, 2000)}
Conditions: ${(trial.conditions || []).join(', ')}
Phase: ${trial.phase || 'Unknown'}
Status: ${trial.status || 'Unknown'}
Sponsor: ${trial.sponsor || 'Unknown'}

Extract the following as JSON:
{
  "genes": ["gene symbols targeted by this trial"],
  "diseases": ["diseases/conditions being treated"],
  "therapy_types": ["therapy approach: gene_replacement, CRISPR_editing, CAR-T, AAV_delivery, mRNA_therapy, RNAi, other"],
  "vectors": ["delivery vectors used if mentioned"],
  "development_stages": ["map phase to: phase1, phase2, phase3, approved"],
  "key_findings": ["1-2 sentence summary of trial objective"],
  "safety_data": {"summary": "any safety info if available"},
  "relevance_score": 1-10
}

Return ONLY the JSON, no other text.`;

  try {
    const sdk = require(require.resolve('z-ai-web-dev-sdk', { paths: [NODE_PATH] }));
    const ZAI = sdk.default;
    const zai = await ZAI.create();
    const result = await zai.createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });
    
    const content = result.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error(`  提取失败 [${trial.nct_id}]:`, error.message);
    return null;
  }
}

/**
 * 使用LLM从新闻中提取结构化实体
 */
async function extractFromNewsArticle(article) {
  const text = `${article.title || ''} ${article.snippet || ''}`;
  if (text.length < 30) return null;
  
  const prompt = `You are a gene technology knowledge extraction expert. Extract structured entities from this news article.

Title: ${article.title || ''}
Snippet: ${article.snippet || ''}

Extract the following as JSON:
{
  "genes": ["gene symbols mentioned"],
  "diseases": ["diseases/conditions mentioned"],
  "therapy_types": ["therapy types mentioned"],
  "companies": ["companies/organizations mentioned"],
  "key_event": "one of: approval, clinical_trial_result, breakthrough, partnership, funding, regulatory, safety_issue, other",
  "event_summary": "1-2 sentence summary",
  "development_stage": "preclinical/phase1/phase2/phase3/approved/unknown",
  "relevance_score": 1-10
}

Return ONLY the JSON.`;

  try {
    const sdk = require(require.resolve('z-ai-web-dev-sdk', { paths: [NODE_PATH] }));
    const ZAI = sdk.default;
    const zai = await ZAI.create();
    const result = await zai.createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });
    
    const content = result.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error(`  提取失败 [${article.url}]:`, error.message);
    return null;
  }
}

/**
 * 获取PubMed论文摘要（补充esummary不返回abstract的问题）
 */
async function fetchAbstracts(pmids, baseUrl) {
  if (pmids.length === 0) return {};
  
  const fetchUrl = `${baseUrl}efetch.fcgi?db=pubmed&id=${pmids.join(',')}&rettype=abstract&retmode=text`;
  
  try {
    const response = await fetch(fetchUrl);
    const text = await response.text();
    
    const abstracts = {};
    const blocks = text.split(/PMID:\s*/);
    
    for (const block of blocks) {
      const pmidMatch = block.match(/^(\d+)/);
      if (!pmidMatch) continue;
      const pmid = pmidMatch[1];
      
      const abstractMatch = block.match(/Abstract[\s\S]*?(?=PMID:|$)/i);
      if (abstractMatch) {
        abstracts[pmid] = abstractMatch[0].trim().substring(0, 2000);
      }
    }
    
    return abstracts;
  } catch (error) {
    console.error(`  摘要获取失败:`, error.message);
    return {};
  }
}

/**
 * 回填PubMed数据
 */
async function backfillPubMed(maxExtract) {
  console.log('\n🧬 ========== 回填PubMed数据 ==========\n');
  
  // 加载raw数据
  const rawFiles = fs.readdirSync(RAW_DIR)
    .filter(f => f.startsWith('pubmed_') && f.endsWith('.json'))
    .sort();
  
  if (rawFiles.length === 0) {
    console.log('⚠️ 没有找到PubMed原始数据');
    return [];
  }
  
  // 加载所有PubMed raw文件
  const allPapers = [];
  const seenPmids = new Set();
  
  for (const file of rawFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(RAW_DIR, file), 'utf-8'));
    for (const paper of (data.papers || [])) {
      if (!seenPmids.has(paper.pmid)) {
        seenPmids.add(paper.pmid);
        allPapers.push(paper);
      }
    }
  }
  
  console.log(`📊 加载了${allPapers.length}篇唯一论文`);
  
  // 检查哪些论文缺少摘要
  const papersWithoutAbstract = allPapers.filter(p => !p.abstract || p.abstract.length < 50);
  const papersWithAbstract = allPapers.filter(p => p.abstract && p.abstract.length >= 50);
  
  console.log(`   有摘要: ${papersWithAbstract.length}篇`);
  console.log(`   缺摘要: ${papersWithoutAbstract.length}篇`);
  
  // 补充缺失的摘要
  if (papersWithoutAbstract.length > 0) {
    console.log('\n📖 补充缺失的摘要...');
    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
    const batchSize = 20;
    let fetched = 0;
    
    for (let i = 0; i < papersWithoutAbstract.length; i += batchSize) {
      const batch = papersWithoutAbstract.slice(i, i + batchSize);
      const pmids = batch.map(p => p.pmid);
      const abstracts = await fetchAbstracts(pmids, baseUrl);
      
      for (const paper of batch) {
        if (abstracts[paper.pmid]) {
          paper.abstract = abstracts[paper.pmid];
          fetched++;
        }
      }
      
      console.log(`  批次${Math.floor(i/batchSize)+1}: 获取了${Object.keys(abstracts).length}篇摘要`);
      await new Promise(resolve => setTimeout(resolve, 500)); // NCBI rate limit
    }
    
    console.log(`✅ 补充了${fetched}篇摘要`);
  }
  
  // 重新统计有摘要的论文
  const extractable = allPapers.filter(p => p.abstract && p.abstract.length >= 50);
  console.log(`\n🔬 可提取实体的论文: ${extractable.length}篇`);
  
  // 跳过已经入库的论文（检查疗法实体中已有的PMID引用）
  const therapies = JSON.parse(fs.readFileSync(path.join(KB_PATH, 'entities/gene_therapies.json'), 'utf-8'));
  const crisprApps = JSON.parse(fs.readFileSync(path.join(KB_PATH, 'entities/crispr_applications.json'), 'utf-8'));
  const existingPmids = new Set();
  for (const e of [...therapies.entities, ...crisprApps.entities]) {
    if (e.sources) {
      for (const s of e.sources) {
        if (s.pmid) existingPmids.add(s.pmid);
        if (s.paper_pmid) existingPmids.add(s.paper_pmid);
      }
    }
    if (e.paper_pmid) existingPmids.add(e.paper_pmid);
  }
  const newExtractable = extractable.filter(p => !existingPmids.has(p.pmid));
  console.log(`   已入库: ${existingPmids.size}篇, 待提取: ${newExtractable.length}篇`);
  
  // 提取实体
  const toExtract = newExtractable.slice(0, maxExtract);
  console.log(`   本次提取上限: ${toExtract.length}篇`);
  
  const entities = [];
  let extracted = 0;
  let failed = 0;
  
  for (let i = 0; i < toExtract.length; i++) {
    const paper = toExtract[i];
    process.stdout.write(`  [${i+1}/${toExtract.length}] PMID:${paper.pmid} - ${(paper.title || '').substring(0, 60)}... `);
    
    const result = await extractFromPubMed(paper);
    if (result && (result.relevance_score || 0) >= 5) {
      entities.push({
        paper_pmid: paper.pmid,
        paper_title: paper.title,
        paper_doi: paper.doi,
        paper_date: paper.pub_date,
        ...result,
        _source_type: 'pubmed',
        extracted_at: new Date().toISOString()
      });
      extracted++;
      console.log(`✅ (relevance: ${result.relevance_score})`);
    } else if (result) {
      console.log(`⏭️ (relevance: ${result.relevance_score}, below threshold)`);
    } else {
      failed++;
      console.log(`❌ 提取失败`);
    }
    
    // LLM调用间隔5秒避免429
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log(`\n📊 PubMed提取结果: ${extracted}条实体, ${failed}次失败`);
  
  // 更新raw文件中的entities
  for (const file of rawFiles) {
    const filePath = path.join(RAW_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // 合并新提取的实体到raw文件
    const existingPmids = new Set((data.entities || []).map(e => e.paper_pmid));
    const newEntities = entities.filter(e => !existingPmids.has(e.paper_pmid));
    data.entities = [...(data.entities || []), ...newEntities];
    data.total_entities_extracted = data.entities.length;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
  
  return entities;
}

/**
 * 回填临床试验数据
 */
async function backfillClinicalTrials(maxExtract) {
  console.log('\n🏥 ========== 回填临床试验数据 ==========\n');
  
  const rawFiles = fs.readdirSync(RAW_DIR)
    .filter(f => f.startsWith('clinical_trials_') && f.endsWith('.json'))
    .sort();
  
  if (rawFiles.length === 0) {
    console.log('⚠️ 没有找到临床试验原始数据');
    return [];
  }
  
  const allTrials = [];
  const seenIds = new Set();
  
  for (const file of rawFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(RAW_DIR, file), 'utf-8'));
    for (const trial of (data.studies || [])) {
      if (!seenIds.has(trial.nct_id)) {
        seenIds.add(trial.nct_id);
        allTrials.push(trial);
      }
    }
  }
  
  console.log(`📊 加载了${allTrials.length}项唯一临床试验`);
  
  const toExtract = allTrials.slice(0, maxExtract);
  console.log(`   本次提取上限: ${toExtract.length}项`);
  
  const entities = [];
  let extracted = 0;
  let failed = 0;
  
  for (let i = 0; i < toExtract.length; i++) {
    const trial = toExtract[i];
    process.stdout.write(`  [${i+1}/${toExtract.length}] ${trial.nct_id} - ${(trial.title || '').substring(0, 60)}... `);
    
    const result = await extractFromClinicalTrial(trial);
    if (result && (result.relevance_score || 0) >= 5) {
      entities.push({
        trial_nct_id: trial.nct_id,
        trial_title: trial.title,
        trial_status: trial.status,
        trial_phase: trial.phase,
        trial_sponsor: trial.sponsor,
        ...result,
        _source_type: 'clinical_trials',
        extracted_at: new Date().toISOString()
      });
      extracted++;
      console.log(`✅ (relevance: ${result.relevance_score})`);
    } else if (result) {
      console.log(`⏭️ (relevance: ${result.relevance_score}, below threshold)`);
    } else {
      failed++;
      console.log(`❌ 提取失败`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log(`\n📊 临床试验提取结果: ${extracted}条实体, ${failed}次失败`);
  return entities;
}

/**
 * 回填新闻数据
 */
async function backfillNews(maxExtract) {
  console.log('\n📰 ========== 回填新闻数据 ==========\n');
  
  const rawFiles = fs.readdirSync(RAW_DIR)
    .filter(f => f.startsWith('news_') && f.endsWith('.json'))
    .sort();
  
  if (rawFiles.length === 0) {
    console.log('⚠️ 没有找到新闻原始数据');
    return [];
  }
  
  const allArticles = [];
  const seenUrls = new Set();
  
  for (const file of rawFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(RAW_DIR, file), 'utf-8'));
    for (const article of (data.articles || [])) {
      if (!seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        allArticles.push(article);
      }
    }
  }
  
  console.log(`📊 加载了${allArticles.length}条唯一新闻`);
  
  if (allArticles.length === 0) {
    console.log('⚠️ 新闻数据为空，跳过');
    return [];
  }
  
  const toExtract = allArticles.filter(a => a.snippet && a.snippet.length > 30).slice(0, maxExtract);
  console.log(`   本次提取上限: ${toExtract.length}条`);
  
  const entities = [];
  let extracted = 0;
  let failed = 0;
  
  for (let i = 0; i < toExtract.length; i++) {
    const article = toExtract[i];
    process.stdout.write(`  [${i+1}/${toExtract.length}] ${(article.title || '').substring(0, 60)}... `);
    
    const result = await extractFromNewsArticle(article);
    if (result && (result.relevance_score || 0) >= 4) {
      entities.push({
        article_title: article.title,
        article_url: article.url,
        article_source: article.source,
        ...result,
        _source_type: 'news',
        extracted_at: new Date().toISOString()
      });
      extracted++;
      console.log(`✅ (relevance: ${result.relevance_score})`);
    } else if (result) {
      console.log(`⏭️ (relevance: ${result.relevance_score}, below threshold)`);
    } else {
      failed++;
      console.log(`❌ 提取失败`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log(`\n📊 新闻提取结果: ${extracted}条实体, ${failed}次失败`);
  return entities;
}

/**
 * 主流程
 */
async function main() {
  const opts = parseArgs();
  
  console.log('🔄 ========== 数据回填启动 ==========');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`📋 参数: source=${opts.source || 'all'}, max=${opts.max}, dryRun=${opts.dryRun}\n`);
  
  const startTime = Date.now();
  const allEntities = [];
  
  // 1. 回填各数据源
  if (!opts.source || opts.source === 'pubmed') {
    const entities = await backfillPubMed(opts.max);
    allEntities.push(...entities);
  }
  
  if (!opts.source || opts.source === 'clinical') {
    const entities = await backfillClinicalTrials(opts.max);
    allEntities.push(...entities);
  }
  
  if (!opts.source || opts.source === 'news') {
    const entities = await backfillNews(opts.max);
    allEntities.push(...entities);
  }
  
  console.log(`\n📊 ========== 提取汇总 ==========`);
  console.log(`   总提取实体: ${allEntities.length}条`);
  
  if (allEntities.length === 0) {
    console.log('⚠️ 没有提取到任何实体，流程结束');
    return;
  }
  
  if (opts.dryRun) {
    console.log('\n🧪 Dry-run模式，跳过验证和入库');
    console.log('提取的实体预览:');
    for (const e of allEntities.slice(0, 5)) {
      console.log(`  - ${e.genes?.join(',') || 'N/A'} → ${e.diseases?.join(',') || 'N/A'} (${e.therapy_types?.join(',') || 'N/A'}) relevance: ${e.relevance_score}`);
    }
    return;
  }
  
  // 2. 交叉验证
  console.log('\n🔬 ========== 交叉验证 ==========\n');
  const collectResults = {
    pubmed: { entities: allEntities.filter(e => e._source_type === 'pubmed') },
    clinical_trials: { entities: allEntities.filter(e => e._source_type === 'clinical_trials') },
    news: { entities: allEntities.filter(e => e._source_type === 'news') }
  };
  
  const validationResult = await validate(allEntities, collectResults);
  
  // 3. 入库
  console.log('\n📥 ========== 入库 ==========\n');
  const ingestResult = await ingest(validationResult.validatedEntities);
  
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  console.log('\n🏁 ========== 数据回填完成 ==========');
  console.log(`⏱️ 总耗时: ${duration}分钟`);
  console.log(`📊 结果:`);
  console.log(`   提取实体: ${allEntities.length}条`);
  console.log(`   验证通过: ${validationResult.validatedEntities.length}条`);
  console.log(`   新争议: ${validationResult.newControversies.length}条`);
  console.log(`   待审核: ${validationResult.newAuditItems.length}条`);
  console.log(`   入库变更: ${JSON.stringify(ingestResult)}`);
}

main().catch(console.error);
