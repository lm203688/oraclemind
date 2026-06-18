/**
 * 临床试验采集器
 * 从ClinicalTrials.gov采集基因疗法临床试验数据
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

/**
 * 搜索ClinicalTrials.gov
 */
async function searchClinicalTrials(condition, maxResults) {
  const url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(condition)}&pageSize=${maxResults}&format=json&filter.overallStatus=RECRUITING,ACTIVE_NOT_RECRUITING,COMPLETED`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const studies = (data.studies || []).map(study => {
      const protocol = study.protocolSection || {};
      const identification = protocol.identificationModule || {};
      const status = protocol.statusModule || {};
      const description = protocol.descriptionModule || {};
      const conditions = protocol.conditionsModule || {};
      const design = protocol.designModule || {};
      const eligibility = protocol.eligibilityModule || {};
      const contacts = protocol.contactsLocationsModule || {};
      
      return {
        nct_id: identification.nctId || '',
        title: identification.briefTitle || '',
        official_title: identification.officialTitle || '',
        status: status.overallStatus || '',
        phase: design.phases?.join(', ') || '',
        conditions: conditions.conditions || [],
        brief_summary: description.briefSummary || '',
        study_type: design.studyType || '',
        enrollment: design.enrollmentInfo?.count || null,
        start_date: status.startDateStruct?.date || '',
        completion_date: status.completionDateStruct?.date || '',
        sponsor: identification.organization?.fullName || '',
        eligibility_criteria: eligibility.eligibilityCriteria || '',
        collected_at: new Date().toISOString(),
        source: 'clinical_trials_gov',
        source_credibility: 'A',
        source_type: 'clinical_trial'
      };
    });
    
    return studies;
  } catch (error) {
    console.error(`临床试验搜索失败 [${condition}]:`, error.message);
    return [];
  }
}

/**
 * 主采集流程
 */
async function runCollection() {
  console.log('🏥 临床试验采集器启动...');
  const config = loadConfig();
  const ctConfig = config.clinical_trials;
  
  if (!ctConfig.enabled) {
    console.log('⏭️ 临床试验采集已禁用');
    return;
  }
  
  const startTime = new Date().toISOString();
  const allStudies = [];
  const seenNctIds = new Set();
  
  for (const condition of ctConfig.conditions) {
    console.log(`  搜索: ${condition}`);
    const studies = await searchClinicalTrials(condition, ctConfig.max_results);
    
    for (const study of studies) {
      if (!seenNctIds.has(study.nct_id)) {
        seenNctIds.add(study.nct_id);
        allStudies.push(study);
      }
    }
    
    console.log(`    找到${studies.length}项试验（去重后总计${allStudies.length}项）`);
    await new Promise(resolve => setTimeout(resolve, ctConfig.rate_limit_ms));
  }
  
  // 保存
  const timestamp = new Date().toISOString().split('T')[0];
  const rawOutput = {
    collection_date: timestamp,
    source: 'clinical_trials',
    total_studies: allStudies.length,
    studies: allStudies
  };
  
  const rawOutputPath = path.join(RAW_OUTPUT_DIR, `clinical_trials_${timestamp}.json`);
  fs.writeFileSync(rawOutputPath, JSON.stringify(rawOutput, null, 2));
  console.log(`💾 原始数据已保存: ${rawOutputPath}`);
  
  console.log(`✅ 临床试验采集完成: ${allStudies.length}项试验`);
  
  return rawOutput;
}

if (require.main === module) {
  runCollection().catch(console.error);
}

module.exports = { runCollection, searchClinicalTrials };
