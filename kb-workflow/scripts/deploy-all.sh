#!/bin/bash
# Deploy all KB sites to Cloudflare Pages via API

CF_EMAIL="463102527@qq.com"
CF_KEY="cfk_M6e0Klb8VmuZEKXGjuRN2LikPZDVUK8Hhua8DUON45dfe78f"
CF_ACCOUNT="ca2b839650877481da6289dd1af8e05b"
BASE="/home/z/my-project"

declare -A SITES
SITES=(
  ["genetech-tools"]="genetech-tools"
  ["tcm-tools"]="tcm-tools"
  ["agent-ecosystem"]="agentecosystem"
  ["robot-parts"]="robotparts"
  ["quantum-computing"]="quantumcomputing"
  ["brain-science"]="brainscience"
  ["nuclear-energy"]="nuclearenergy"
  ["exo-science"]="exoscience"
  ["alien-minerals"]="alienminerals"
  ["deep-sea-tech"]="deepseatech"
  ["new-energy"]="newenergy"
  ["life-science"]="lifescience"
)

for dir in "${!SITES[@]}"; do
  project="${SITES[$dir]}"
  website_dir="$BASE/$dir/website"
  
  if [ ! -d "$website_dir" ]; then
    echo "⚠️  Skipping $dir - no website dir"
    continue
  fi
  
  echo "🚀 Deploying $dir → $project..."
  
  # Create a temporary deployment directory with all files
  tmp_dir=$(mktemp -d)
  cp -r "$website_dir"/* "$tmp_dir/" 2>/dev/null
  # Copy .new files over root-owned originals
  for f in "$website_dir"/*.new; do
    if [ -f "$f" ]; then
      basename=$(basename "$f" .new)
      cp "$f" "$tmp_dir/$basename"
    fi
  done
  
  # Deploy using wrangler
  cd "$tmp_dir"
  CLOUDFLARE_API_TOKEN="" npx wrangler pages deploy . --project-name="$project" 2>&1 | tail -5
  
  rm -rf "$tmp_dir"
  echo ""
done

echo "🎉 All sites deployed!"
