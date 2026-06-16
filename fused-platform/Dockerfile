FROM python:3.12-slim AS base

LABEL org.opencontainers.image.title="ATEX AI Service Marketplace"
LABEL org.opencontainers.image.description="27 AI services + 12 knowledge engines. One API Key, MCP protocol, pay-per-use."
LABEL org.opencontainers.image.url="https://lm203688.github.io/atex/"
LABEL org.opencontainers.image.source="https://github.com/lm203688/atex"
LABEL org.opencontainers.image.licenses="AGPL-3.0"

WORKDIR /app

# Install Node.js runtime for AI capabilities (z-ai-web-dev-sdk)
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && curl -fsSL https://bun.sh/install | bash \
    && ~/.bun/bin/bun install -g z-ai-web-dev-sdk \
    && apt-get purge -y curl && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

ENV NODE_PATH=/root/.bun/install/global/node_modules
ENV PATH="/root/.bun/bin:${PATH}"

# Copy all source files
COPY atex.py .
COPY config.json .
COPY package.json .
COPY service_executor.py .
COPY content_safety.py .
COPY job_market.py .
COPY skill_market.py .
COPY a2a_protocol.py .
COPY realtime.py .
COPY services/ ./services/
COPY api/ ./api/
COPY docs/ ./docs/
COPY static/ ./static/
COPY payment/ ./payment/
COPY data/ ./data/

# Python stdlib only — no pip install needed
EXPOSE 8420

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8420/api/v1/status')" || exit 1

CMD ["python3", "api/server.py"]
