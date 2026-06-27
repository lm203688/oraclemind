#!/usr/bin/env node
/**
 * LLM Extract Helper - reads prompt from stdin, outputs JSON entities
 * Usage: echo "prompt" | node llm-extract.js
 */
const SDK = require('z-ai-web-dev-sdk').default;

async function main() {
  const chunks = [];
  process.stdin.on('data', c => chunks.push(c));
  process.stdin.on('end', async () => {
    const prompt = Buffer.concat(chunks).toString('utf8');
    if (!prompt.trim()) {
      console.log('[]');
      return;
    }
    try {
      const client = await SDK.create();
      const resp = await client.chat.completions.create({
        model: 'glm-4-plus',
        messages: [{role: 'user', content: prompt}],
        temperature: 0.1,
        max_tokens: 4000
      });
      const content = resp.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try { 
          process.stdout.write(jsonMatch[0]);
          return;
        }
        catch(e) {
          const fixed = jsonMatch[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          try { process.stdout.write(fixed); return; } catch(e2) {}
        }
      }
      process.stdout.write('[]');
    } catch(e) {
      console.error('LLM_ERROR: ' + e.message.slice(0, 100));
      process.stdout.write('[]');
    }
  });
}
main();
