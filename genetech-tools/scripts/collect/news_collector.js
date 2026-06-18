/**
 * 新闻采集器
 * 通过web搜索采集基因技术领域最新新闻和公告
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../../config/sources.json');
const KB_PATH = path.join(__dirname, '../../knowledge-base');
const RAW_OUTPUT_DIR = path.join(KB_PATH, 'raw');

if (!fs.existsSync(RAW_OUTPUT_DIR)) {
  fs.mkdirSync(RAW_OUTPUT_DIR, { recursive: true });
}

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

const NODE_PATH = '/home/z/.bun/install/global/node_modules';

/**
 * 使用z-ai web_search搜索新闻
 */
async function searchNews(query) {
  try {
    const sdk = require(require.resolve('z-ai-web-dev-sdk', { paths: [NODE_PATH] }));
    const ZAI = sdk.default;
    const zai = await ZAI.create();
    const results = await zai.invokeFunction('web_search', { query, num: 10 });
    return results || [];
  } catch (error) {
    console.error(`新闻搜索失败 [${query}]:`, error.message);
    return [];
  }
}

/**
 * 使用z-ai page_reader读取新闻全文
 */
async function readNewsPage(url) {
  try {
    const sdk = require(require.resolve('z-ai-web-dev-sdk', { paths: [NODE_PATH] }));
    const ZAI = sdk.default;
    const zai = await ZAI.create();
    const result = await zai.invokeFunction('page_reader', { url });
    return result;
  } catch (error) {
    console.error(`页面读取失败 [${url}]:`, error.message);
    return null;
  }
}

/**
 * 使用LLM从新闻中提取结构化实体
 */
async function extractFromNews(article) {
  const prompt = `You are a gene technology knowledge extraction expert. Extract structured entities from this news article.

Title: ${article.title || ''}
Snippet: ${article.snippet || ''}
Content: ${(article.content || '').substring(0, 3000)}

Extract the following as JSON:
{
  "genes": ["gene symbols mentioned"],
  "diseases": ["diseases/conditions mentioned"],
  "therapy_types": ["therapy types mentioned"],
  "companies": ["companies/organizations mentioned"],
  "key_event": "one of: approval, clinical_trial_result, breakthrough, partnership, funding, regulatory, safety_issue, other",
  "event_summary": "1-2 sentence summary of the key event",
  "development_stage": "preclinical/phase1/phase2/phase3/approved/unknown",
  "credibility_indicators": ["specific_data_points", "named_sources", "peer_reviewed_references"],
  "hype_signals": ["marketing_language", "vague_claims", "no_specific_data"],
  "relevance_score": "1-10"
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
    console.error(`新闻实体提取失败:`, error.message);
    return null;
  }
}

/**
 * 主采集流程
 */
async function runCollection() {
  console.log('📰 新闻采集器启动...');
  const config = loadConfig();
  const newsConfig = config.news;
  
  if (!newsConfig.enabled) {
    console.log('⏭️ 新闻采集已禁用');
    return;
  }
  
  const startTime = new Date().toISOString();
  const allArticles = [];
  const allEntities = [];
  let totalCollected = 0;
  let totalExtracted = 0;
  
  // 1. 搜索新闻
  for (const query of newsConfig.search_queries) {
    console.log(`  搜索: ${query}`);
    const results = await searchNews(query);
    
    for (const result of results) {
      allArticles.push({
        title: result.name || result.title || '',
        url: result.url || '',
        snippet: result.snippet || '',
        source: result.host_name || '',
        collected_at: new Date().toISOString(),
        source_type: 'news'
      });
      totalCollected++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 2. 去重（按URL）
  const seen = new Set();
  const uniqueArticles = allArticles.filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
  
  console.log(`📊 找到${uniqueArticles.length}条唯一新闻（去重前${totalCollected}条）`);
  
  // 3. 提取实体（仅从snippet，限制数量+加长间隔避免429）
  const maxArticlesToExtract = 10; // 控制LLM调用次数
  const articlesToExtract = uniqueArticles.filter(a => a.snippet && a.snippet.length > 30).slice(0, maxArticlesToExtract);
  
  for (const article of articlesToExtract) {
    const entities = await extractFromNews(article);
    if (entities && entities.relevance_score >= 4) {
      allEntities.push({
        article_title: article.title,
        article_url: article.url,
        article_source: article.source,
        ...entities,
        extracted_at: new Date().toISOString()
      });
      totalExtracted++;
    }
    // 加长间隔避免429限流
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // 4. 保存
  const timestamp = new Date().toISOString().split('T')[0];
  const rawOutput = {
    collection_date: timestamp,
    source: 'news',
    total_articles: uniqueArticles.length,
    total_entities_extracted: totalExtracted,
    articles: uniqueArticles,
    entities: allEntities
  };
  
  const rawOutputPath = path.join(RAW_OUTPUT_DIR, `news_${timestamp}.json`);
  fs.writeFileSync(rawOutputPath, JSON.stringify(rawOutput, null, 2));
  console.log(`💾 原始数据已保存: ${rawOutputPath}`);
  
  console.log(`✅ 新闻采集完成: ${uniqueArticles.length}条新闻, ${totalExtracted}条实体`);
  
  return rawOutput;
}

if (require.main === module) {
  runCollection().catch(console.error);
}

module.exports = { runCollection, searchNews, extractFromNews };
