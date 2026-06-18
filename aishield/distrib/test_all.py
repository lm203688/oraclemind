#!/usr/bin/env python3
"""Test local MCP server still works"""
import sys, os
sys.path.insert(0, '/home/z/my-project/aishield')
sys.path.insert(0, '/home/z/my-project/aishield/mcp')

# Test import
try:
    from mcp.server import local_scan, remote_scan, REMOTE_MODE
    print(f"✅ MCP server imports OK")
    print(f"   REMOTE_MODE: {REMOTE_MODE}")
except Exception as e:
    print(f"❌ Import error: {e}")

# Test local scan (quick, use a small repo)
try:
    result = local_scan("https://github.com/octocat/Hello-World", "mcp", "test")
    score = result.get("overall_score", "?")
    badge = result.get("badge_level", "?")
    print(f"✅ Local scan works: score={score}, badge={badge}")
except Exception as e:
    print(f"❌ Scan error: {e}")

# Test PyPI SDK import
try:
    sys.path.insert(0, '/home/z/my-project/aishield/distrib/pypi-package')
    from aishield import AIShield, ScanResult, AIShieldError
    print(f"✅ PyPI SDK imports OK")
    print(f"   Version: {__import__('aishield').__version__}")
except Exception as e:
    print(f"❌ SDK import error: {e}")

# Test guardrail imports (node)
try:
    import subprocess
    r = subprocess.run(['node', '-e', "require('/home/z/my-project/aishield/distrib/guardrail-mcp/index.js'); console.log('guardrail syntax OK')"], 
                      capture_output=True, text=True, timeout=5)
    if r.returncode == 0:
        print(f"✅ Guardrail MCP syntax OK")
    else:
        # Try just syntax check
        r2 = subprocess.run(['node', '--check', '/home/z/my-project/aishield/distrib/guardrail-mcp/index.js'],
                           capture_output=True, text=True, timeout=5)
        if r2.returncode == 0:
            print(f"✅ Guardrail MCP syntax OK (check)")
        else:
            print(f"❌ Guardrail: {r2.stderr[:200]}")
except Exception as e:
    print(f"⚠️ Guardrail test: {e}")

# Test npm package syntax
try:
    r = subprocess.run(['node', '--check', '/home/z/my-project/aishield/distrib/npm-package/index.js'],
                      capture_output=True, text=True, timeout=5)
    if r.returncode == 0:
        print(f"✅ npm package syntax OK")
    else:
        print(f"❌ npm package: {r.stderr[:200]}")
except Exception as e:
    print(f"⚠️ npm test: {e}")

print("\n=== All local tests complete ===")
