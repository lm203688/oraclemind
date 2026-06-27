#!/usr/bin/env python3
"""Run agent-geo for specific sites - args: site_dir1 site_dir2 ..."""
import sys, os
BASE = "/home/z/my-project"
os.chdir(BASE)

# Read the main script
code = open("kb-workflow/agent-distribution/daily-agent-geo.py").read()

# Get site dirs from args
site_dirs = sys.argv[1:]
if not site_dirs:
    print("Usage: python3 run-sites.py site_dir1 site_dir2 ...")
    sys.exit(1)

# Patch SITES to only include requested
# Find all SITES entries
import re
# Extract SITES list and filter
sites_block = re.search(r'SITES = \[(.*?)\]', code, re.DOTALL).group(1)
site_entries = re.findall(r'\{[^}]+"dir":\s*"([^"]+)"[^}]*\}', sites_block)
# Build filter condition
filter_dirs = '", "'.join(site_dirs)
code = code.replace('for site in SITES:', f'for site in [s for s in SITES if s["dir"] in ["{filter_dirs}"]]:')

exec(code)
