#!/usr/bin/env python3
"""Deploy HealthLens v0.5.0 to ECS via SFTP"""

import paramiko
import os
import tarfile
import io

ECS_HOST = "150.158.119.19"
ECS_USER = "ubuntu"
SSH_KEY = "/home/z/.ssh/id_rsa"
REMOTE_DIR = "/home/ubuntu/healthlens"

# Files to deploy
DEPLOY_FILES = [
    "app_v05.py",
    "security.py",
    "pii_sanitizer.py",
    "loinc_mapper.py",
    "fhir_exporter.py",
    "migrations.py",
    "logging_config.py",
    "mcp_server.py",
    "requirements.txt",
    "blueprints/__init__.py",
    "blueprints/auth.py",
    "blueprints/upload.py",
    "blueprints/health.py",
    "blueprints/connectors.py",
    "blueprints/webhooks.py",
    "blueprints/analysis.py",
    "tests/__init__.py",
    "tests/test_healthlens.py",
]

def deploy():
    print("Connecting to ECS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(ECS_HOST, username=ECS_USER, key_filename=SSH_KEY, banner_timeout=60, timeout=60)

    # Create directories
    print("Creating remote directories...")
    for d in ["", "/blueprints", "/tests", "/logs", "/data", "/migrations"]:
        ssh.exec_command(f"mkdir -p {REMOTE_DIR}{d}")
    
    # Install dependencies on ECS
    print("Installing dependencies on ECS...")
    stdin, stdout, stderr = ssh.exec_command(
        f"cd {REMOTE_DIR} && pip3 install --user bcrypt loguru 2>&1",
        timeout=120
    )
    print(stdout.read().decode())
    
    # Upload files via SFTP
    print("Uploading files...")
    sftp = ssh.open_sftp()
    
    for f in DEPLOY_FILES:
        local_path = os.path.join("/home/z/my-project/healthlens", f)
        remote_path = f"{REMOTE_DIR}/{f}"
        
        if not os.path.exists(local_path):
            print(f"  ⚠️ Skip {f} (not found)")
            continue
            
        try:
            sftp.put(local_path, remote_path)
            print(f"  ✅ {f}")
        except Exception as e:
            print(f"  ❌ {f}: {e}")
    
    sftp.close()
    
    # Backup old app.py and deploy new version
    print("\nBacking up old app.py...")
    stdin, stdout, stderr = ssh.exec_command(
        f"cp {REMOTE_DIR}/app.py {REMOTE_DIR}/app_v04_backup.py 2>/dev/null; echo done",
        timeout=30
    )
    print(stdout.read().decode().strip())
    
    # Replace app.py with app_v05.py
    print("Activating v0.5.0...")
    stdin, stdout, stderr = ssh.exec_command(
        f"cp {REMOTE_DIR}/app_v05.py {REMOTE_DIR}/app.py",
        timeout=30
    )
    err = stderr.read().decode()
    if err:
        print(f"  Error: {err}")
    else:
        print("  ✅ app.py replaced with v0.5.0")
    
    # Run migrations
    print("Running migrations...")
    stdin, stdout, stderr = ssh.exec_command(
        f"cd {REMOTE_DIR} && python3 -c \"from migrations import run_migrations; run_migrations()\"",
        timeout=60
    )
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print(f"  Migration stderr: {err}")
    
    # Run tests on ECS
    print("Running tests on ECS...")
    stdin, stdout, stderr = ssh.exec_command(
        f"cd {REMOTE_DIR} && python3 -m pytest tests/test_healthlens.py -v 2>&1 | tail -15",
        timeout=120
    )
    print(stdout.read().decode())
    
    # Restart service
    print("Restarting HealthLens service...")
    stdin, stdout, stderr = ssh.exec_command(
        "sudo systemctl restart healthlens.service 2>&1",
        timeout=30
    )
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print(f"  Restart stderr: {err}")
    
    import time
    time.sleep(3)
    
    # Health check
    print("Health check...")
    stdin, stdout, stderr = ssh.exec_command(
        "curl -s http://localhost:8432/health",
        timeout=15
    )
    result = stdout.read().decode()
    print(f"  Response: {result}")
    
    ssh.close()
    print("\n✅ Deployment complete!")

if __name__ == "__main__":
    deploy()
