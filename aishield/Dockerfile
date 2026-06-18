FROM python:3.12-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir flask gunicorn

# Copy application
COPY . /app/

# Expose port
EXPOSE 8450

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8450/api/v1/stats || exit 1

# Run with gunicorn
CMD ["gunicorn", "api.server_flask:app", "--bind", "0.0.0.0:8450", "--workers", "4", "--timeout", "30", "--threads", "4", "--access-logfile", "-"]
