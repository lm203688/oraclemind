const SDK = require('z-ai-web-dev-sdk').default;
const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 6) {
    console.log('Usage: node expand_zai.js <site_dir> <filename> <count> <prefix> <start> "prompt"');
    process.exit(1);
  }
  
  const [siteDir, filename, countStr, prefix, startStr, promptTpl] = args;
  const count = parseInt(countStr);
  const startNum = parseInt(startStr);
  const BASE = '/home/z/my-project';
  
  // Find entities dir
  let edir = path.join(BASE, siteDir, 'knowledge-base', 'entities');
  if (!fs.existsSync(edir)) edir = path.join(BASE, siteDir, 'entities');
  const fpath = path.join(edir, filename);
  
  // Read existing
  let existing = [];
  let isDict = false;
  let rawDict = null;
  if (fs.existsSync(fpath)) {
    const raw = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    if (Array.isArray(raw)) {
      existing = raw;
    } else if (typeof raw === 'object') {
      isDict = true;
      rawDict = raw;
      existing = raw.entities || raw.data || [];
    }
  }
  
  const oldCount = existing.length;
  console.log(`File: ${fpath} | Existing: ${oldCount} | Target: +${count}`);
  
  const client = await SDK.create();
  const newEnts = [];
  const bs = 15;
  const batches = Math.ceil(count / bs);
  
  for (let b = 0; b < batches; b++) {
    const bc = Math.min(bs, count - b * bs);
    const bst = startNum + b * bs;
    const prompt = promptTpl
      .replace(/\$\$count/g, String(bc))
      .replace(/\$\$prefix/g, prefix)
      .replace(/\$\$num/g, String(bst));
    
    try {
      const resp = await client.chat.completions.create({
        model: 'glm-4-flash',
        messages: [{role: 'user', content: prompt}],
        max_tokens: 2000,
        temperature: 0.7
      });
      const content = resp.choices[0].message.content;
      
      // Parse JSON array
      let ents = [];
      const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const m = clean.match(/\[[\s\S]*\]/);
      if (m) {
        try {
          ents = JSON.parse(m[0]);
        } catch {
          try {
            ents = JSON.parse(m[0].replace(/,]/g, ']').replace(/,}/g, '}'));
          } catch(e) {
            console.log(`  batch ${b+1}/${batches}: parse error`);
          }
        }
      }
      newEnts.push(...ents);
      console.log(`  batch ${b+1}/${batches}: +${ents.length}`);
    } catch(e) {
      console.log(`  batch ${b+1}/${batches}: API error: ${e.message}`);
    }
    
    // Rate limit: 3s between batches
    if (b < batches - 1) await new Promise(r => setTimeout(r, 3000));
  }
  
  // Merge & write
  const allEnts = [...existing, ...newEnts];
  if (isDict && rawDict) {
    rawDict.entities = allEnts;
    if ('last_updated' in rawDict) rawDict.last_updated = '2026-06-28';
    fs.writeFileSync(fpath, JSON.stringify(rawDict, null, 2));
  } else {
    fs.writeFileSync(fpath, JSON.stringify(allEnts, null, 2));
  }
  
  console.log(`Done: ${oldCount} -> ${allEnts.length} (+${newEnts.length})`);
}

main().catch(e => { console.error(e); process.exit(1); });
