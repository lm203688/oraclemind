FROM python:3.11-slim

LABEL maintainer="HealthLens"
LABEL description="跨生态健康数据聚合器"

WORKDIR /app

# 安装系统依赖（OCR需要）
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr tesseract-ocr-chi-sim poppler-utils && \
    rm -rf /var/lib/apt/lists/*

# 安装Python依赖
RUN pip install --no-cache-dir flask pdf2image Pillow

COPY . .

# 创建必要目录
RUN mkdir -p uploads data

EXPOSE 8432

ENV BIT_ASSISTANT_URL=http://150.158.119.19:8431
ENV PORT=8432

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8432/health')" || exit 1

CMD ["python", "app.py"]
