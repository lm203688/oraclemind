#!/usr/bin/env node
/**
 * GeneTech Knowledge Engine — MCP Server
 * 
 * Provides 12 domain knowledge bases to AI agents via MCP protocol.
 * Use with Claude Desktop, Cursor, or any MCP-compatible client.
 * 
 * Usage in Claude Desktop config:
 * {
 *   "mcpServers": {
 *     "genetech": {
 *       "command": "npx",
 *       "args": ["@frontierkb/mcp-server"]
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const DOMAINS = {
  genetech: { host: 'genetech-tools.pages.dev', name: 'Gene Technology', desc: 'Genes, diseases, CRISPR, gene therapies' },
  life: { host: 'lifescience-epe.pages.dev', name: 'Life Science', desc: 'Synthetic biology, cell therapy, longevity' },
  energy: { host: 'newenergy-nya.pages.dev', name: 'New Energy', desc: 'Solar, hydrogen, wind, grid, storage' },
  agent: { host: 'agentecosystem.pages.dev', name: 'Agent Ecosystem', desc: 'MCP servers, SDKs, protocols, frameworks' },
  brain: { host: 'brainscience.pages.dev', name: 'Brain Science', desc: 'Neurotech, brain disorders, cognition' },
  quantum: { host: 'quantumcomputing.pages.dev', name: 'Quantum Computing', desc: 'Algorithms, hardware, software' },
  nuclear: { host: 'nuclearenergy.pages.dev', name: 'Nuclear Energy', desc: 'Fission, fusion, fuel, waste' },
  exo: { host: 'exoscience.pages.dev', name: 'Exo-Science', desc: 'Exoplanets, astrobiology, space exploration' },
  mineral: { host: 'alienminerals.pages.dev', name: 'Alien Minerals', desc: 'Rare earth, mining technology' },
  deepsea: { host: 'deepseatech.pages.dev', name: 'Deep-Sea Tech', desc: 'Biology, underwater technology' },
  robot: { host: 'robotparts.pages.dev', name: 'Robot Parts', desc: 'Sensors, actuators, protocols' },
  tcm: { host: 'tcm-tools.pages.dev', name: 'Traditional Chinese Medicine', desc: 'Herbs, formulas, acupuncture' },
};

const server = new Server(
  { name: 'genetech-kb', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_knowledge',
      description: 'Search across 12 frontier science knowledge bases (4,000+ structured entities). Domains: gene tech, quantum, nuclear, brain science, deep-sea, exo-science, etc.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          domain: { type: 'string', enum: Object.keys(DOMAINS), description: 'Specific domain to search (optional, searches all if omitted)' },
          limit: { type: 'number', description: 'Max results (default: 10)', default: 10 }
        },
        required: ['query']
      }
    },
    {
      name: 'list_domains',
      description: 'List all 12 knowledge domains with entity counts',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'get_entity',
      description: 'Get detailed information about a specific entity by ID',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string', enum: Object.keys(DOMAINS) },
          entity_id: { type: 'string', description: 'Entity ID (e.g., GENE-001)' }
        },
        required: ['domain', 'entity_id']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    if (name === 'list_domains') {
      const domains = Object.entries(DOMAINS).map(([key, d]) => ({
        key, name: d.name, description: d.desc, api: `https://${d.host}/api/entities.json`
      }));
      return { content: [{ type: 'text', text: JSON.stringify(domains, null, 2) }] };
    }
    
    if (name === 'search_knowledge') {
      const { query, domain, limit = 10 } = args;
      const domainsToSearch = domain ? [domain] : Object.keys(DOMAINS);
      const results = {};
      
      for (const d of domainsToSearch) {
        const conf = DOMAINS[d];
        if (!conf) continue;
        try {
          const resp = await fetch(`https://${conf.host}/api/entities.json`);
          const data = await resp.json();
          const matches = (data.entities || [])
            .filter(e => JSON.stringify(e).toLowerCase().includes(query.toLowerCase()))
            .slice(0, limit);
          if (matches.length > 0) {
            results[d] = { domain: conf.name, count: matches.length, matches };
          }
        } catch(e) { /* skip */ }
      }
      
      const summary = Object.entries(results).map(([k, v]) => 
        `${v.domain}: ${v.count} matches`
      ).join('\n');
      
      return { 
        content: [{ 
          type: 'text', 
          text: `Found results in ${Object.keys(results).length} domains:\n${summary}\n\n${JSON.stringify(results, null, 2).slice(0, 8000)}` 
        }] 
      };
    }
    
    if (name === 'get_entity') {
      const { domain, entity_id } = args;
      const conf = DOMAINS[domain];
      if (!conf) throw new Error(`Unknown domain: ${domain}`);
      
      const resp = await fetch(`https://${conf.host}/api/entities.json`);
      const data = await resp.json();
      const entity = (data.entities || []).find(e => e.id === entity_id);
      
      if (!entity) throw new Error(`Entity ${entity_id} not found in ${conf.name}`);
      return { content: [{ type: 'text', text: JSON.stringify(entity, null, 2) }] };
    }
    
    throw new Error(`Unknown tool: ${name}`);
  } catch(error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('GeneTech MCP Server running');
