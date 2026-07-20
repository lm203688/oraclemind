#!/usr/bin/env node
/**
 * agent-trust-init
 *
 * One-command AgentTrust identity setup:
 *   npx agent-trust-init
 *
 * What it does (< 5 seconds):
 *   1. Generates a real Ed25519 keypair
 *   2. Derives a did:key:z6Mk... DID from the public key
 *   3. Writes .agent-trust.json to the current directory
 *   4. Outputs a success message with the DID
 *
 * Usage:
 *   npx agent-trust-init           # Basic setup
 *   npx agent-trust-init --show    # Show identity details
 *   npx agent-trust-init --verify  # Verify the .agent-trust.json file
 *
 * The .agent-trust.json file:
 *   - Contains your agent's DID and keypair
 *   - Add to .gitignore — it contains your private key!
 *   - Load with: import { identityFileToKeypair } from 'agent-trust-core'
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  generateKeypair,
  keypairToIdentityFile,
  verifySignature,
  signData,
  identityFileToKeypair,
} from 'agent-trust-core';
import type { AgentIdentityFile } from 'agent-trust-core';

const IDENTITY_FILE = '.agent-trust.json';
const args = process.argv.slice(2);
const flag = args[0] ?? '';

// ANSI colors (gracefully degraded in non-TTY environments)
const tty = process.stdout.isTTY;
const c = {
  green:  tty ? '\x1b[32m' : '',
  cyan:   tty ? '\x1b[36m' : '',
  yellow: tty ? '\x1b[33m' : '',
  red:    tty ? '\x1b[31m' : '',
  dim:    tty ? '\x1b[2m'  : '',
  bold:   tty ? '\x1b[1m'  : '',
  reset:  tty ? '\x1b[0m'  : '',
};

function log(msg: string) { process.stdout.write(msg + '\n'); }
function ok(msg: string)  { log(`${c.green}✓${c.reset} ${msg}`); }
function info(msg: string){ log(`${c.cyan}ℹ${c.reset} ${msg}`); }
function warn(msg: string){ log(`${c.yellow}⚠${c.reset} ${msg}`); }
function err(msg: string) { log(`${c.red}✗${c.reset} ${msg}`); }

// ── --show flag ──────────────────────────────────────────────────────────────

if (flag === '--show') {
  const path = join(process.cwd(), IDENTITY_FILE);
  if (!existsSync(path)) {
    err(`No identity file found at ${IDENTITY_FILE}. Run: npx agent-trust-init`);
    process.exit(1);
  }
  const file: AgentIdentityFile = JSON.parse(readFileSync(path, 'utf8'));
  log('');
  log(`${c.bold}AgentTrust Identity${c.reset}`);
  log(`  DID:        ${c.cyan}${file.did}${c.reset}`);
  log(`  Public Key: ${file.publicKey}`);
  log(`  Created:    ${file.createdAt}`);
  log(`  Version:    ${file.version}`);
  log('');
  process.exit(0);
}

// ── --verify flag ─────────────────────────────────────────────────────────────

if (flag === '--verify') {
  const path = join(process.cwd(), IDENTITY_FILE);
  if (!existsSync(path)) {
    err(`No identity file found at ${IDENTITY_FILE}.`);
    process.exit(1);
  }
  const file: AgentIdentityFile = JSON.parse(readFileSync(path, 'utf8'));
  const { privateKey, publicKey } = identityFileToKeypair(file);
  const testMsg = `agent-trust-verify:${Date.now()}`;
  const sig = await signData(testMsg, privateKey);
  const valid = await verifySignature(testMsg, sig, publicKey);
  if (valid) {
    ok(`Keypair verified: ${file.did}`);
    ok('Sign → Verify round-trip: PASS');
  } else {
    err('Keypair verification FAILED — identity file may be corrupted.');
    process.exit(1);
  }
  process.exit(0);
}

// ── Main: generate identity ──────────────────────────────────────────────────

const path = join(process.cwd(), IDENTITY_FILE);

log('');
log(`${c.bold}AgentTrust Init v0.2.0${c.reset}`);
log(`${c.dim}Generate your agent's Ed25519 identity${c.reset}`);
log('');

if (existsSync(path)) {
  const existing: AgentIdentityFile = JSON.parse(readFileSync(path, 'utf8'));
  warn(`Identity file already exists at ${c.bold}${IDENTITY_FILE}${c.reset}`);
  info(`DID: ${c.cyan}${existing.did}${c.reset}`);
  log('');
  log(`To overwrite, delete ${IDENTITY_FILE} and run again.`);
  log(`To view details: ${c.cyan}npx agent-trust-init --show${c.reset}`);
  log('');
  process.exit(0);
}

// Generate keypair
process.stdout.write(`  Generating Ed25519 keypair...`);
const keypair = await generateKeypair();
process.stdout.write(` ${c.green}done${c.reset}\n`);

// Verify the keypair works
process.stdout.write(`  Verifying keypair...`);
const testMsg = `agent-trust-init:${Date.now()}`;
const sig = await signData(testMsg, keypair.privateKey);
const valid = await verifySignature(testMsg, sig, keypair.publicKey);
if (!valid) {
  process.stdout.write(` ${c.red}FAILED${c.reset}\n`);
  err('Keypair verification failed — please retry.');
  process.exit(1);
}
process.stdout.write(` ${c.green}done${c.reset}\n`);

// Write identity file
const identityFile = keypairToIdentityFile(keypair);
writeFileSync(path, JSON.stringify(identityFile, null, 2), 'utf8');

log('');
log(`${c.green}${c.bold}Identity created successfully!${c.reset}`);
log('');
log(`  DID:  ${c.cyan}${keypair.did}${c.reset}`);
log(`  File: ${c.dim}${IDENTITY_FILE}${c.reset}`);
log('');
log(`${c.yellow}⚠${c.reset}  ${c.bold}Add .agent-trust.json to your .gitignore!${c.reset}`);
log(`   It contains your private key.`);
log('');
log(`${c.dim}Next steps:${c.reset}`);
log(`  1. Add to .gitignore:  echo ".agent-trust.json" >> .gitignore`);
log(`  2. Load in your code:`);
log(`${c.dim}     import { identityFileToKeypair } from 'agent-trust-core';${c.reset}`);
log(`${c.dim}     import identityFile from './.agent-trust.json' assert { type: 'json' };${c.reset}`);
log(`${c.dim}     const { did, privateKey, publicKey } = identityFileToKeypair(identityFile);${c.reset}`);
log('');
log(`  GitHub: ${c.dim}https://github.com/lm203688/agent-trust-protocol${c.reset}`);
log('');
