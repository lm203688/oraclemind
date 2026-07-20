#!/usr/bin/env node

/**
 * AgentTrust CLI Demo Tool
 * 
 * A lightweight CLI demonstrating how to integrate AgentTrust Protocol
 * into any existing Agent workflow. Supports:
 *   - Quick setup (npx install)
 *   - Trust score lookup by DID
 *   - Transaction submission
 *   - Local score computation (no external dependencies)
 * 
 * Usage:
 *   npx agent-trust-cli <command> [options]
 * 
 * Commands:
 *   check <did>           Look up trust score for a DID
 *   submit <event.json>   Submit a transaction event
 *   formula               Show scoring algorithm
 *   demo                  Run a full demo with sample data
 *   serve                 Start local MCP server (stdio)
 */

import { computeTrustScore, getEcosystemMeta } from 'agent-trust-core';
import { DIDResolver } from 'agent-trust-core';
import { createMcpServer } from 'agent-trust-mcp-server';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(process.cwd(), '.agent-trust', 'store.json');

// --- Colors for terminal output ---
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function printLogo() {
  console.log(`${C.cyan}
   ___                _         _   _               _   
  / _ \              | |       | | (_)             | |  
 / /_\ \ _ __   __ _ | |_  ___ | |_ _  _ __   __ _ | |_ 
 |  _  || '__| / _\` || __|/ __|| __|| || '__| / _\` || __|
 | | | || |   | (_| || |_ \__ \| |_ | || |   | (_| || |_ 
 \_| |_/|_|    \__,_| \__||___/ \__||_||_|    \__,_| \__|
${C.reset}
  ${C.dim}Open, auditable trust layer for AI Agents${C.reset}
  ${C.dim}v0.1.0 | https://github.com/lm203688/agent-trust-protocol${C.reset}
`);
}

// --- Store management ---
async function loadStore() {
  try {
    const data = await fs.readFile(STORE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { transactions: [], agents: {} };
  }
}

async function saveStore(store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

// --- Commands ---

async function cmdCheck(did) {
  if (!did) {
    console.log(`${C.red}Error: DID is required${C.reset}`);
    console.log(`Usage: agent-trust-cli check <did>`);
    process.exit(1);
  }

  console.log(`${C.bold}Checking trust score for:${C.reset} ${C.cyan}${did}${C.reset}\n`);

  const store = await loadStore();
  const transactions = store.transactions.filter(
    t => t.provider === did || t.consumer === did
  );

  const score = computeTrustScore(transactions, did);
  const ecosystem = getEcosystemMeta();

  // Grade color
  const gradeColor = {
    'A': C.green,
    'B': C.green,
    'C': C.yellow,
    'D': C.yellow,
    'F': C.red,
  }[score.grade] || C.reset;

  console.log(`${C.bold}╔══════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}║${C.reset}  Agent Trust Score                    ${C.bold}║${C.reset}`);
  console.log(`${C.bold}╠══════════════════════════════════════╣${C.reset}`);
  console.log(`${C.bold}║${C.reset}  Overall: ${gradeColor}${score.overallScore}${C.reset}/100 (Grade: ${gradeColor}${score.grade}${C.reset})  ${C.bold}║${C.reset}`);
  console.log(`${C.bold}║${C.reset}  Confidence: ${C.yellow}${score.confidenceTier}${C.reset}                    ${C.bold}║${C.reset}`);
  console.log(`${C.bold}║${C.reset}  Transactions: ${C.cyan}${score.transactionCount}${C.reset}                      ${C.bold}║${C.reset}`);
  console.log(`${C.bold}╠══════════════════════════════════════╣${C.reset}`);
  console.log(`${C.bold}║${C.reset}  Dimensions:                           ${C.bold}║${C.reset}`);
  console.log(`${C.bold}║${C.reset}    • Completion:    ${C.green}${score.dimensions.completionRate}${C.reset}/100           ${C.bold}║${C.reset}`);
  console.log(`${C.bold}║${C.reset}    • Reliability:   ${C.green}${score.dimensions.reliabilityScore}${C.reset}/100           ${C.bold}║${C.reset}`);
  console.log(`${C.bold}║${C.reset}    • Consistency:   ${C.yellow}${score.dimensions.consistencyScore}${C.reset}/100           ${C.bold}║${C.reset}`);
  console.log(`${C.bold}║${C.reset}    • Response:     ${C.yellow}${score.dimensions.responseTime}${C.reset}/100           ${C.bold}║${C.reset}`);
  console.log(`${C.bold}╚══════════════════════════════════════╝${C.reset}`);
  
  console.log(`\n${C.dim}Protocol: ${ecosystem.protocol} v${ecosystem.version}${C.reset}`);
  console.log(`${C.dim}Quickstart: ${ecosystem.quickstart}${C.reset}`);
}

async function cmdSubmit(filePath) {
  if (!filePath) {
    console.log(`${C.red}Error: Event JSON file is required${C.reset}`);
    console.log(`Usage: agent-trust-cli submit <event.json>`);
    console.log(`\nExample event.json:`);
    console.log(JSON.stringify({
      provider: "did:web:agent-b.example.com",
      consumer: "did:web:agent-a.example.com",
      status: "success",
      protocol: "x402",
      responseTimeMs: 820,
      amount: "0.001"
    }, null, 2));
    process.exit(1);
  }

  let event;
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    event = JSON.parse(data);
  } catch (e) {
    console.log(`${C.red}Error: Cannot read or parse ${filePath}${C.reset}`);
    console.log(e.message);
    process.exit(1);
  }

  console.log(`${C.bold}Submitting transaction event...${C.reset}\n`);
  console.log(`${C.dim}${JSON.stringify(event, null, 2)}${C.reset}\n`);

  const store = await loadStore();
  store.transactions.push({
    ...event,
    timestamp: new Date().toISOString(),
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  });

  await saveStore(store);

  // Recompute score
  const transactions = store.transactions.filter(
    t => t.provider === event.provider
  );
  const score = computeTrustScore(transactions, event.provider);

  console.log(`${C.green}✓ Transaction recorded${C.reset}`);
  console.log(`${C.green}✓ Updated score for ${event.provider}: ${score.overallScore}/100${C.reset}`);
  console.log(`\n${C.dim}Store: ${STORE_PATH}${C.reset}`);
}

async function cmdFormula() {
  console.log(`${C.bold}AgentTrust Scoring Formula${C.reset}\n`);
  
  console.log(`${C.bold}Composite Score:${C.reset}`);
  console.log(`  overallScore = completionRate × 0.35`);
  console.log(`               + reliabilityScore × 0.30`);
  console.log(`               + consistencyScore × 0.20`);
  console.log(`               + responseTime × 0.15\n`);

  console.log(`${C.bold}Dimensions:${C.reset}`);
  console.log(`  ${C.cyan}1. Completion Rate (35%)${C.reset}`);
  console.log(`     successful / total × 100`);
  console.log(`  ${C.cyan}2. Reliability Score (30%)${C.reset}`);
  console.log(`     max(0, 100 − disputed/total × 200)`);
  console.log(`     Disputes weighted 2×`);
  console.log(`  ${C.cyan}3. Consistency Score (20%)${C.reset}`);
  console.log(`     Bayesian-smoothed: (10×70 + n×observed) / (10 + n)`);
  console.log(`     Prior: 10 pseudo-transactions at score 70`);
  console.log(`  ${C.cyan}4. Response Time Score (15%)${C.reset}`);
  console.log(`     Linear mapping: 500ms→100, 10s→0\n`);

  console.log(`${C.bold}Confidence Tiers:${C.reset}`);
  console.log(`  ${C.red}insufficient_data${C.reset} : < 5 transactions`);
  console.log(`  ${C.yellow}low${C.reset}             : 5–24 transactions`);
  console.log(`  ${C.yellow}medium${C.reset}          : 25–99 transactions`);
  console.log(`  ${C.green}high${C.reset}            : ≥ 100 transactions\n`);

  console.log(`${C.bold}Grade Mapping:${C.reset}`);
  console.log(`  ${C.green}A${C.reset}: 90–100  ${C.green}B${C.reset}: 75–89  ${C.yellow}C${C.reset}: 60–74  ${C.yellow}D${C.reset}: 40–59  ${C.red}F${C.reset}: 0–39\n`);

  console.log(`${C.dim}Full spec: https://github.com/lm203688/agent-trust-protocol/blob/main/docs/scoring-algorithm.md${C.reset}`);
}

async function cmdDemo() {
  printLogo();

  console.log(`${C.bold}Running full demo with sample data...${C.reset}\n`);

  const sampleDID = "did:web:demo-agent.example.com";
  const store = await loadStore();

  // Clear old demo data
  store.transactions = store.transactions.filter(
    t => !t.id?.startsWith('demo-')
  );

  // Add sample transactions
  const events = [
    { provider: sampleDID, consumer: "did:web:client-1.example.com", status: "success", protocol: "x402", responseTimeMs: 600, amount: "0.001" },
    { provider: sampleDID, consumer: "did:web:client-2.example.com", status: "success", protocol: "mcp", responseTimeMs: 1200, amount: "0.005" },
    { provider: sampleDID, consumer: "did:web:client-3.example.com", status: "success", protocol: "x402", responseTimeMs: 800, amount: "0.002" },
    { provider: sampleDID, consumer: "did:web:client-4.example.com", status: "failure", protocol: "a2a", responseTimeMs: 15000, amount: "0.001" },
    { provider: sampleDID, consumer: "did:web:client-5.example.com", status: "success", protocol: "mcp", responseTimeMs: 900, amount: "0.003" },
  ];

  for (const [i, event] of events.entries()) {
    store.transactions.push({
      ...event,
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      id: `demo-${i}`
    });
  }

  await saveStore(store);

  console.log(`${C.green}✓ Added 5 sample transactions${C.reset}\n`);

  // Compute and display score
  const transactions = store.transactions.filter(
    t => t.provider === sampleDID
  );
  const score = computeTrustScore(transactions, sampleDID);

  await cmdCheck(sampleDID);

  console.log(`\n${C.bold}Next steps:${C.reset}`);
  console.log(`  1. Try your own DID: ${C.cyan}agent-trust-cli check did:web:your-agent.com${C.reset}`);
  console.log(`  2. Submit a transaction: ${C.cyan}agent-trust-cli submit event.json${C.reset}`);
  console.log(`  3. See the formula: ${C.cyan}agent-trust-cli formula${C.reset}`);
  console.log(`  4. Start MCP server: ${C.cyan}agent-trust-cli serve${C.reset}`);
}

async function cmdServe() {
  console.log(`${C.bold}Starting MCP Server (stdio transport)...${C.reset}\n`);
  console.log(`${C.dim}This server exposes 3 tools:${C.reset}`);
  console.log(`  • get_agent_trust_score`);
  console.log(`  • get_scoring_formula`);
  console.log(`  • submit_transaction\n`);
  console.log(`${C.dim}Connect with: npx @anthropic/mcp-inspector${C.reset}\n`);

  const server = createMcpServer();
  await server.connect(new StdioServerTransport());
}

async function cmdHelp() {
  printLogo();
  console.log(`${C.bold}Usage:${C.reset} agent-trust-cli <command> [options]\n`);
  console.log(`${C.bold}Commands:${C.reset}`);
  console.log(`  ${C.cyan}check <did>${C.reset}       Look up trust score for a DID`);
  console.log(`  ${C.cyan}submit <file>${C.reset}     Submit a transaction event (JSON)`);
  console.log(`  ${C.cyan}formula${C.reset}           Show scoring algorithm details`);
  console.log(`  ${C.cyan}demo${C.reset}              Run full demo with sample data`);
  console.log(`  ${C.cyan}serve${C.reset}             Start local MCP server (stdio)`);
  console.log(`  ${C.cyan}help${C.reset}              Show this help message\n`);
  console.log(`${C.bold}Examples:${C.reset}`);
  console.log(`  ${C.dim}# Check a DID${C.reset}`);
  console.log(`  agent-trust-cli check did:web:alpha-agent.example.com`);
  console.log(`  ${C.dim}# Submit a transaction${C.reset}`);
  console.log(`  agent-trust-cli submit ./event.json`);
  console.log(`  ${C.dim}# Run demo${C.reset}`);
  console.log(`  agent-trust-cli demo\n`);
  console.log(`${C.bold}Store:${C.reset} ${C.dim}${STORE_PATH}${C.reset}`);
  console.log(`${C.bold}Docs:${C.reset} ${C.dim}https://github.com/lm203688/agent-trust-protocol${C.reset}\n`);
}

// --- Main ---

async function main() {
  const [,, command, ...args] = process.argv;

  switch (command) {
    case 'check':
      await cmdCheck(args[0]);
      break;
    case 'submit':
      await cmdSubmit(args[0]);
      break;
    case 'formula':
      await cmdFormula();
      break;
    case 'demo':
      await cmdDemo();
      break;
    case 'serve':
      await cmdServe();
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      await cmdHelp();
      break;
    default:
      console.log(`${C.red}Unknown command: ${command}${C.reset}`);
      console.log(`Run ${C.cyan}agent-trust-cli help${C.reset} for usage.`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error(`${C.red}Error:${C.reset}`, err.message);
  process.exit(1);
});
