#!/usr/bin/env node
/**
 * Create herbs.json and diseases.json from tcm-tools data.js
 * so add-agent-api.js can pick up TCM data properly
 */
const fs = require('fs');
const path = require('path');

const today = '2026-06-22T06:40:00Z';
const tcmBase = '/home/z/my-project/tcm-tools/knowledge-base/entities';

// Read data.js (it's a JS file, extract JSON)
const dataJs = fs.readFileSync('/home/z/my-project/tcm-tools/website/data.js', 'utf8');
// Parse the DB object — use Node require by evaluating in a sandbox
const vm = require('vm');
const sandbox = { DB: null };
vm.createContext(sandbox);
vm.runInContext(dataJs.replace('const DB =', 'DB ='), sandbox);
const db = sandbox.DB;

// Create herbs.json
const herbsData = {
  version: "1.0.0",
  last_updated: today,
  description: "中药实体库——来自TCMBANK数据库的中药材",
  entities: db.herbs.map(h => ({
    ...h,
    category: "herbs",
    description: h.name + " — TCMBANK收录的中药材实体"
  }))
};

fs.writeFileSync(path.join(tcmBase, 'herbs.json'), JSON.stringify(herbsData, null, 2));
console.log(`✅ herbs.json: ${herbsData.entities.length} entities`);

// Create diseases.json
const diseasesData = {
  version: "1.0.0",
  last_updated: today,
  description: "中医药疾病实体库——来自TCMBANK数据库的疾病条目",
  entities: db.diseases.map(d => ({
    ...d,
    category: "diseases",
    description: d.name + " — TCMBANK收录的疾病/适应症实体"
  }))
};

fs.writeFileSync(path.join(tcmBase, 'diseases.json'), JSON.stringify(diseasesData, null, 2));
console.log(`✅ diseases.json: ${diseasesData.entities.length} entities`);
