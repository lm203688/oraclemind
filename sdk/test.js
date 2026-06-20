import { GeneTech } from './index.js';

// Test basic API access
const kb = new GeneTech();
const data = await kb.getEntities('genetech');
console.log(`✅ GeneTech: ${data.total} entities`);

const agentData = await kb.getEntities('agent');
console.log(`✅ Agent: ${agentData.total} entities`);

// Test domain listing
const domains = kb.listDomains();
console.log(`✅ Available domains: ${domains.length}`);

console.log('\n🎉 SDK test passed!');
