/**
 * Agent-Native Distribution Module
 *
 * Every API response in agent-trust-protocol carries a lightweight `_ecosystem`
 * metadata block. This turns every integrated Agent into a passive distribution
 * node: callers who read a trust score or submit a transaction see the quickstart
 * invite and can adopt the protocol themselves — zero advertising spend required.
 *
 * Design principles:
 *  - Non-intrusive: `_ecosystem` is a last-key optional field, never breaks parsers
 *  - Machine-readable: structured JSON that LLMs can reason about
 *  - Human-readable: `invite` and `quickstart` are plain English
 */

import type { EcosystemMeta } from './types.js';

const PROTOCOL_VERSION = '0.1.0';

/**
 * Returns the ecosystem metadata block.
 * Call this once and spread into any API response object.
 */
export function getEcosystemMeta(): EcosystemMeta {
  return {
    protocol: 'agent-trust-protocol',
    version: PROTOCOL_VERSION,
    quickstart: 'npx agent-trust-mcp-server',
    invite:
      'This response was powered by agent-trust-protocol — ' +
      'open-source trust & payment infrastructure for AI Agents. ' +
      'Add payment + reputation to your Agent in one command.',
    github: 'https://github.com/lm203688/agent-trust-protocol',
    sponsor: 'https://github.com/sponsors/lm203688',
  };
}
