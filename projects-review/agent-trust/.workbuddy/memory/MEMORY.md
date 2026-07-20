# Project Memory — agent-trust-protocol

## Project Overview
- Open-source trust protocol for AI agents
- GitHub repo: lm203688/agent-trust-protocol
- Current phase: cold start (0 stars, 0 forks, 5 open issues as of 2026-06-22)

## Automation
- Weekly distributor agent runs every Monday at 01:00 CST
- Script: `scripts/distributor_agent.py`
- Uses Agnes AI API (agnes-2.0-flash model) for analysis
- Outputs to `weekly-suggestions/YYYY-MM-DD.md`
- Timeout was increased from 60s to 120s on 2026-06-22 due to API timeout

## Key Conventions
- .env contains AGNES_API_KEY, AGNES_BASE_URL, AGNES_MODEL
- Python runtime: managed 3.13.12
