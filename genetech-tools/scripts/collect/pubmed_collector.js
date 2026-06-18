/**
 * PubMed 采集器
 * 从PubMed/NCBI采集基因技术相关最新论文
 * 
 * 采集流程：
 * 1. 按关键词搜索最新论文
 * 2. 获取论文摘要和元数据
 * 3. 提取结构化实体（基因、疾病、疗法类型等）
 * 4. 输出原始采集数据供验证层使用
 */

const fs = require('fs');
const path = require('path');

const NODE_PATH = '/home/z/.bun/install/global/node_modules';

const CONFIG_PATH = path.join(__dirname, '../../config/sources.json');
const KEYWORDS_PATH = path.join(__dirname, '../../config/keywords.json');
const KB_PATH = path.join(__dirname, '../../knowledge-base');
const COLLECTION_LOG_PATH = path.join(KB_PATH, 'metadata/collection_log.json');
const RAW_OUTPUT_DIR = path.join(KB_PATH, 'raw');

// 确保raw目录存在
if (!fs.existsSync(RAW_OUTPUT_DIR)) {
  fs.mkdirSync(RAW_OUTPUT_DIR, { recursive: true });
}

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadKeywords() {
  return JSON.parse(fs.readFileSync(KEYWORDS_PATH, 'utf-8'));
}

function loadCollectionLog() {
  return JSON.parse(fs.readFileSync(COLLECTION_LOG_PATH, 'utf-8'));
}

function saveCollectionLog(log) {
  fs.writeFileSync(COLLECTION_LOG_PATH, JSON.stringify(log, null, 2));
}

/**
 * 搜索PubMed获取论文ID列表
 */
async function searchPubMed(query, maxResults, baseUrl) {
  const searchUrl = `${baseUrl}esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=date`;
  
  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.esearchresult?.idlist) {
      return data.esearchresult.idlist;
    }
    return [];
  } catch (error) {
    console.error(`PubMed搜索失败 [${query}]:`, error.message);
    return [];
  }
}

/**
 * 获取论文详情（摘要、作者、期刊等）
 * 使用esummary API（返回JSON），不使用efetch（返回XML）
 */
async function fetchPaperDetails(pmids, baseUrl) {
  if (pmids.length === 0) return [];
  
  // esummary返回JSON格式，比efetch更易解析
  const fetchUrl = `${baseUrl}esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
  
  try {
    const response = await fetch(fetchUrl);
    const data = await response.json();
    
    const papers = [];
    const uids = data.result?.uids || [];
    
    for (const pmid of uids) {
      const article = data.result?.[pmid];
      if (!article) continue;
      
      papers.push({
        pmid: pmid,
        title: article.title || '',
        authors: (article.authors || []).map(a => a.name),
        journal: article.fulljournalname || article.source || '',
        pub_date: article.pubdate || '',
        // esummary不返回abstract，需要单独获取
        abstract: '',
        doi: article.elocationid || '',
        keywords: article.keywords || [],
        collected_at: new Date().toISOString(),
        source: 'pubmed',
        source_credibility: 'A',
        source_type: 'peer_reviewed'
      });
    }
    return papers;
  } catch (error) {
    console.error(`PubMed详情获取失败:`, error.message);
    return [];
  }
}

/**
 * 获取论文摘要（单独调用，因为esummary不返回abstract）
 * 使用efetch + XML解析（比text格式更可靠）
 */
async function fetchAbstracts(pmids, baseUrl) {
  if (pmids.length === 0) return {};
  
  const abstracts = {};
  const batchSize = 100;
  
  for (let i = 0; i < pmids.length; i += batchSize) {
    const batch = pmids.slice(i, i + batchSize);
    const fetchUrl = `${baseUrl}efetch.fcgi?db=pubmed&id=${batch.join(',')}&rettype=abstract&retmode=xml`;
    
    try {
      const response = await fetch(fetchUrl);
      const text = await response.text();
      
      // Parse XML - extract PMID and AbstractText
      const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
      let match;
      while ((match = articleRegex.exec(text)) !== null) {
        const article = match[1];
        
        // Extract PMID
        const pmidMatch = article.match(/<PMID[^>]*>(\d+)<\/PMID>/);
        if (!pmidMatch) continue;
        const pmid = pmidMatch[1];
        
        // Extract AbstractText
        const abstractParts = [];
        const abstractRegex = /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g;
        let absMatch;
        while ((absMatch = abstractRegex.exec(article)) !== null) {
          // Remove any child tags
          const cleanText = absMatch[1].replace(/<[^>]+>/g, '').trim();
          if (cleanText) abstractParts.push(cleanText);
        }
        
        if (abstractParts.length > 0) {
          const abstract = abstractParts.join(' ');
          if (abstract.length > 50) {
            abstracts[pmid] = abstract.substring(0, 3000);
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500)); // NCBI rate limit
    } catch (error) {
      console.error(`摘要获取失败 (batch ${Math.floor(i/batchSize)+1}):`, error.message);
    }
  }
  
  return abstracts;
}

/**
 * 使用LLM从论文摘要中提取结构化实体
 * 含429限流重试机制
 */
let _zaiInstance = null;

async function getZAI() {
  if (!_zaiInstance) {
    const sdk = require(require.resolve('z-ai-web-dev-sdk', { paths: [NODE_PATH] }));
    const ZAI = sdk.default;
    _zaiInstance = await ZAI.create();
  }
  return _zaiInstance;
}

async function extractEntities(paper, retryCount = 0) {
  const prompt = `You are a gene technology knowledge extraction expert. Extract structured entities from this research paper.

Title: ${paper.title}
Abstract: ${paper.abstract}

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
    const zai = await getZAI();
    const result = await zai.createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });
    
    const content = result.choices?.[0]?.message?.content || '';
    // 提取JSON部分
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    // 429限流重试：指数退避，最多重试3次
    if ((error.message?.includes('429') || error.message?.includes('rate') || error.message?.includes('limit')) && retryCount < 3) {
      const waitMs = Math.pow(2, retryCount) * 10000; // 10s, 20s, 40s
      console.log(`  ⏳ 429限流，${waitMs/1000}秒后重试 (${retryCount+1}/3) [PMID:${paper.pmid}]`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
      return extractEntities(paper, retryCount + 1);
    }
    console.error(`实体提取失败 [PMID:${paper.pmid}]:`, error.message);
    return null;
  }
}

/**
 * 主采集流程
 */
async function runCollection() {
  console.log('🧬 PubMed采集器启动...');
  const config = loadConfig();
  const pubmedConfig = config.pubmed;
  
  if (!pubmedConfig.enabled) {
    console.log('⏭️ PubMed采集已禁用');
    return;
  }
  
  const startTime = new Date().toISOString();
  let totalCollected = 0;
  let totalExtracted = 0;
  const allPapers = [];
  const allEntities = [];
  const errors = [];
  
  // 1. 搜索论文
  console.log(`📋 执行${pubmedConfig.search_queries.length}个搜索查询...`);
  
  const allPmids = new Set();
  for (const query of pubmedConfig.search_queries) {
    console.log(`  搜索: ${query}`);
    const pmids = await searchPubMed(query, pubmedConfig.max_results, pubmedConfig.base_url);
    pmids.forEach(id => allPmids.add(id));
    
    // 遵守速率限制
    await new Promise(resolve => setTimeout(resolve, pubmedConfig.rate_limit_ms));
  }
  
  console.log(`📊 找到${allPmids.size}篇唯一论文`);
  
  // 2. 获取论文详情（分批，每批50篇）
  const pmidArray = Array.from(allPmids);
  const batchSize = 50;
  
  for (let i = 0; i < pmidArray.length; i += batchSize) {
    const batch = pmidArray.slice(i, i + batchSize);
    console.log(`  获取详情: ${batch.length}篇 (批次${Math.floor(i/batchSize)+1})`);
    
    const papers = await fetchPaperDetails(batch, pubmedConfig.base_url);
    allPapers.push(...papers);
    totalCollected += papers.length;
    
    await new Promise(resolve => setTimeout(resolve, pubmedConfig.rate_limit_ms));
  }
  
  // 2.5 获取摘要（分批，每批20篇，使用efetch text模式）
  console.log(`📖 获取论文摘要...`);
  const abstractBatchSize = 20;
  for (let i = 0; i < pmidArray.length; i += abstractBatchSize) {
    const batch = pmidArray.slice(i, i + abstractBatchSize);
    const abstracts = await fetchAbstracts(batch, pubmedConfig.base_url);
    
    for (const paper of allPapers) {
      if (abstracts[paper.pmid]) {
        paper.abstract = abstracts[paper.pmid];
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, pubmedConfig.rate_limit_ms));
  }
  
  const papersWithAbstract = allPapers.filter(p => p.abstract && p.abstract.length > 50);
  console.log(`📊 ${papersWithAbstract.length}/${allPapers.length}篇论文有摘要`);
  
  // 3. 提取实体（仅处理有摘要的论文，且限制数量控制API成本）
  console.log(`🔬 提取结构化实体...`);
  const maxPapersToExtract = 30; // 每次最多提取30篇，控制LLM调用成本
  const papersToExtract = papersWithAbstract.slice(0, maxPapersToExtract);
  
  for (const paper of papersToExtract) {
    if (!paper.abstract || paper.abstract.length < 50) continue;
    
    const entities = await extractEntities(paper);
    if (entities && entities.relevance_score >= 5) {
      allEntities.push({
        paper_pmid: paper.pmid,
        paper_title: paper.title,
        paper_doi: paper.doi,
        paper_date: paper.pub_date,
        ...entities,
        extracted_at: new Date().toISOString()
      });
      totalExtracted++;
    }
    
    // LLM调用间隔（5秒避免429限流）
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // 4. 保存原始采集数据
  const timestamp = new Date().toISOString().split('T')[0];
  const rawOutput = {
    collection_date: timestamp,
    source: 'pubmed',
    total_papers_found: allPmids.size,
    total_papers_collected: totalCollected,
    total_entities_extracted: totalExtracted,
    papers: allPapers,
    entities: allEntities,
    errors: errors
  };
  
  const rawOutputPath = path.join(RAW_OUTPUT_DIR, `pubmed_${timestamp}.json`);
  fs.writeFileSync(rawOutputPath, JSON.stringify(rawOutput, null, 2));
  console.log(`💾 原始数据已保存: ${rawOutputPath}`);
  
  // 5. 更新采集日志
  const log = loadCollectionLog();
  log.runs.push({
    source: 'pubmed',
    started_at: startTime,
    completed_at: new Date().toISOString(),
    papers_found: allPmids.size,
    papers_collected: totalCollected,
    entities_extracted: totalExtracted,
    output_file: rawOutputPath,
    status: 'completed',
    errors: errors.length
  });
  log.last_updated = new Date().toISOString();
  saveCollectionLog(log);
  
  console.log(`✅ PubMed采集完成: ${totalCollected}篇论文, ${totalExtracted}条实体`);
  
  return rawOutput;
}

// 直接运行
if (require.main === module) {
  runCollection().catch(console.error);
}

module.exports = { runCollection, searchPubMed, fetchPaperDetails, extractEntities };
