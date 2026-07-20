FROM python:3.11-slim

LABEL maintainer="比特助手"
LABEL description="辅助Agent - 基于Agnes 2.0 Flash"

WORKDIR /app

COPY agent.py .

# 无额外依赖，纯标准库

EXPOSE 8430

ENV AGNES_API_KEY=""
ENV AGENT_PORT=8430

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8430/health')" || exit 1

CMD ["python", "agent.py"]
