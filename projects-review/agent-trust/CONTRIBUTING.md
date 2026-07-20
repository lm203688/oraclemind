# Contributing to AgentTrust Protocol

> Thank you for your interest in making the Agent economy more trustworthy. This guide covers everything you need to get started, from setup to submitting your first PR.

---

## Table of Contents

1. [Project Vision](#project-vision)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [API Interface Draft](#api-interface-draft)
5. [How to Contribute](#how-to-contribute)
6. [Code Standards](#code-standards)
7. [Testing](#testing)
8. [Algorithm Changes](#algorithm-changes)
9. [Ecosystem Integration](#ecosystem-integration)
10. [Community Guidelines](#community-guidelines)

---

## Project Vision

**AgentTrust Protocol** is an open, auditable trust & reputation layer for AI Agents. Our goal is simple: when Agent A pays Agent B to do a job, Agent A should know whether Agent B is trustworthy — before sending money.

We believe:
- **Trust infrastructure must be auditable** — no black-box algorithms, no proprietary gatekeeping.
- **Agent-native first** — the protocol should be usable by agents themselves, via MCP tools and W3C VCs, not just human dashboards.
- **Protocol-agnostic** — x402, MCP, A2A, and whatever comes next should all feed the same trust graph.
- **Open source forever** — Apache 2.0, no rug-pull, no bait-and-switch.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (we test on 18, 20, 22)
- **npm** ≥ 9
- **Git**
- **Python 3.10+** (for Distributor Agent scripts only)

### Clone & Install

```bash
git clone https://github.com/lm203688/agent-trust-protocol.git
cd agent-trust-protocol
npm install
npm run build
```

### Verify Your Setup

```bash
# Run the MCP server locally
node packages/mcp-server/dist/index.js

# In another terminal, test with the MCP inspector
npx @anthropic/mcp-inspector
```

Or run the built-in tests (once we have them — see [Testing](#testing)):

```bash
npm test
```

---

## Development Setup

### Workspace Structure

We use a monorepo with npm workspaces. Each package has its own `src/` and `dist/`:

| Package | Path | Purpose |
|---------|------|---------|
| `agent-trust-core` | `packages/core/` | Scoring engine, DID resolver, VC issuer, types |
| `agent-trust-mcp-server` | `packages/mcp-server/` | MCP server exposing 3 tools |
| `agent-trust-x402-listener` | `packages/x402-listener/` | Webhook receiver for x402 events |

### Build

```bash
npm run build          # Build all packages
npm run build:core     # Build core only
npm run build:mcp      # Build MCP server only
npm run build:x402     # Build x402 listener only
```

### Lint & Format

```bash
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run format         # Prettier
```

---

## API Interface Draft

This section documents the current and planned public interfaces. Treat it as a living document — it evolves as the protocol matures.

### MCP Tool Interface (Current — v0.1)

All tools are exposed via the MCP server using stdio transport.

#### `get_agent_trust_score`

Query any agent's trust score by its DID.

**Input:**
```json
{
  "did": "did:web:alpha-agent.example.com",
  "format": "summary"
}
```

**Output:**
```json
{
  "did": "did:web:alpha-agent.example.com",
  "overallScore": 87,
  "grade": "B",
  "confidenceTier": "high",
  "transactionCount": 150,
  "dimensions": {
    "completionRate": 95,
    "responseTime": 83,
    "reliabilityScore": 90,
    "consistencyScore": 78
  }
}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `did` | string | ✅ | The DID of the agent to query |
| `format` | `summary` or `vc` | ❌ | `summary` (default) or `vc` for W3C Verifiable Credential |

#### `get_scoring_formula`

Returns the full algorithm spec with weights, formulas, and confidence tiers. This is what makes the system auditable.

**Input:** none

**Output:**
```json
{
  "formula": "overallScore = completionRate × 0.35 + reliabilityScore × 0.30 + consistencyScore × 0.20 + responseTime × 0.15",
  "dimensions": [ ... ],
  "confidenceTiers": [ ... ],
  "gradeMapping": [ ... ]
}
```

#### `submit_transaction`

Submit a transaction event to update an agent's score.

**Input:**
```json
{
  "provider": "did:web:beta-agent.example.com",
  "consumer": "did:web:alpha-agent.example.com",
  "status": "success",
  "protocol": "x402",
  "responseTimeMs": 820,
  "amount": "0.001"
}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | string | ✅ | DID of the service provider |
| `consumer` | string | ✅ | DID of the consumer |
| `status` | `success`, `failure`, `disputed` | ✅ | Transaction outcome |
| `protocol` | `x402`, `mcp`, `a2a` | ✅ | Which protocol was used |
| `responseTimeMs` | number | ❌ | Response latency in milliseconds |
| `amount` | string | ❌ | Payment amount (ETH/USD) |
| `metadata` | object | ❌ | Arbitrary additional data |

**Output:**
```json
{
  "success": true,
  "updatedScore": 88,
  "transactionCount": 151
}
```

### REST API (Planned — v0.2)

```
GET /api/v1/score/{did}
GET /api/v1/score/{did}?format=vc
GET /api/v1/formula
POST /api/v1/transaction
GET /api/v1/health
```

This is tracked in [Roadmap v0.2](https://github.com/lm203688/agent-trust-protocol#roadmap). Want to help implement it? See [How to Contribute](#how-to-contribute).

---

## How to Contribute

### 1. Pick an Issue (or Open One)

Browse [open issues](https://github.com/lm203688/agent-trust-protocol/issues) or start a [discussion](https://github.com/lm203688/agent-trust-protocol/discussions). For algorithm changes, **open an issue first** explaining the motivation before writing code.

Good first issues are tagged `good first issue` or `help wanted`.

### 2. Fork & Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix-name
```

### 3. Make Changes

- Write code in TypeScript.
- Update tests (or add them if none exist).
- For algorithm changes, update `docs/scoring-algorithm.md` in the same PR.
- Run `npm run lint` and `npm run build` before committing.

### 4. Commit

We use conventional commits:

```
feat: add PostgreSQL adapter
fix: resolve DID with trailing slash
docs: update scoring formula explanation
refactor: extract store interface for swappable backends
```

### 5. Open a Pull Request

- Fill out the PR template (if available) or describe what you changed and why.
- Link to any related issues.
- Ensure CI passes (GitHub Actions runs `build`, `lint`, and `test` on every PR).

### 6. Review & Merge

A maintainer will review your PR within 48 hours. We may request changes or ask questions. Once approved, we'll squash-merge and add you to the contributors list.

---

## Code Standards

### TypeScript

- Strict mode enabled (`strict: true` in `tsconfig.json`).
- No `any` without a comment explaining why.
- Prefer `interface` over `type` for public APIs.
- Document all exported functions with JSDoc.

### File Organization

```
packages/core/src/
  ├── types.ts       # All interfaces & type definitions
  ├── scoring.ts     # Algorithm implementation
  ├── resolver.ts    # DID resolution logic
  ├── issuer.ts      # VC issuance logic
  ├── store.ts       # Data layer abstraction
  ├── ecosystem.ts   # Protocol metadata & hooks
  └── index.ts       # Public exports
```

### Error Handling

- Use typed errors (not bare `throw new Error("...")`).
- All MCP tool errors should be returned as `isError: true` with a descriptive `content` message.
- Log errors to stderr; never crash the MCP server on a single bad request.

---

## Testing

### Current State

We are at **0% test coverage** — this is a priority. We need:

- Unit tests for `scoring.ts` (edge cases, Bayesian smoothing, dispute weights)
- Unit tests for `resolver.ts` (DID parsing, DID Document resolution)
- Integration tests for MCP tools (mock stdio transport)
- Integration tests for x402 webhook (mock HTTP requests, HMAC verification)

### Running Tests

```bash
npm test               # Run all tests
npm run test:core      # Run core package tests
npm run test:mcp       # Run MCP server tests
npm run test:x402      # Run x402 listener tests
```

### Writing Tests

We use **Vitest** (planned). Tests should live next to the source file:

```
packages/core/src/
  ├── scoring.ts
  └── __tests__/
      └── scoring.test.ts
```

Example test pattern:

```typescript
import { describe, it, expect } from 'vitest';
import { computeTrustScore } from '../scoring.js';

describe('computeTrustScore', () => {
  it('returns 0 for empty transaction history', () => {
    const result = computeTrustScore([]);
    expect(result.overallScore).toBe(0);
    expect(result.confidenceTier).toBe('insufficient_data');
  });

  it('penalizes disputed transactions 2×', () => {
    // ... test case
  });
});
```

---

## Algorithm Changes

The scoring algorithm is the heart of this project. Changing it has real consequences for any agent relying on these scores.

### Rules for Algorithm Changes

1. **Open an issue first** — explain the motivation, the proposed change, and the expected impact.
2. **Update `docs/scoring-algorithm.md`** — the spec must match the code.
3. **Update `packages/core/src/scoring.ts`** — implement the change.
4. **Add or update tests** — every change must have test coverage.
5. **Link the issue in your PR** — so reviewers have context.

### What Makes a Good Algorithm Change

- **Clear rationale** — "This prevents gaming the system by ..."
- **Empirical backing** — if possible, show data from real transactions or simulations.
- **Backward compatibility** — if the change is breaking, explain the migration path.
- **Transparency** — the change must be explainable to a non-technical user.

---

## Ecosystem Integration

One of the most valuable contributions is integrating AgentTrust into existing agent frameworks. We want to make it trivial for any agent ecosystem to adopt this protocol.

### Framework Integrations (Wanted)

| Framework | Integration Idea | Status |
|-----------|-----------------|--------|
| **LangChain** | Tool wrapper that queries trust score before calling an external agent | 🔴 Wanted |
| **CrewAI** | Custom agent class with built-in trust score checks | 🔴 Wanted |
| **AutoGen** | Group chat participant that vets new agents by trust score | 🔴 Wanted |
| **Langflow** | Visual node for "Trust Check" in workflow builder | 🔴 Wanted |
| **Dify** | Plugin that shows trust score in agent profile | 🔴 Wanted |
| **OpenCode** | Middleware that intercepts tool calls and checks provider score | 🔴 Wanted |

### How to Add an Integration

1. Create a new directory under `examples/` or `integrations/`.
2. Add a README explaining how to install and use it.
3. Include a minimal working example (e.g., a 10-line script).
4. Open a PR with the `integration` label.

### MCP Server Distribution

Every MCP server instance is a **distribution channel**. When you run `npx agent-trust-mcp-server`, the server embeds a `_ecosystem` hook in every tool response that points back to this repo and invites the caller to join the ecosystem.

This is **agent-native distribution** — the protocol promotes itself through every agent that uses it.

---

## Community Guidelines

### Be Respectful

- Assume good intent.
- Criticize ideas, not people.
- No harassment, discrimination, or toxic behavior.

### Be Constructive

- "This won't work because X" is better than "This is bad."
- Suggest alternatives when you raise concerns.
- Share use cases — what trust signals matter for YOUR agent?

### Be Patient

- We're a small team. Response times may vary.
- If an issue hasn't been answered in 48 hours, a polite bump is fine.

### Attribution

We will credit all contributors in our release notes and maintain a `CONTRIBUTORS.md` file. If you prefer not to be listed, let us know.

---

## Questions?

- **General questions:** Open a [Discussion](https://github.com/lm203688/agent-trust-protocol/discussions)
- **Bug reports:** Open an [Issue](https://github.com/lm203688/agent-trust-protocol/issues)
- **Security issues:** Email security@agent-trust.dev (placeholder — TBD)

---

<p align="center">
  <sub>Built with ❤️ for the open Agent ecosystem</sub><br>
  <sub>Your contribution makes the Agent economy safer for everyone.</sub>
</p>
