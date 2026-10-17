#!/usr/bin/env bash
# ==============================================================================
# MakeUsSparkle - Update & Continuous Deployment Script
# Pulls latest code, rebuilds frontend & backend, and reloads PM2 services
# ==============================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

echo -e "${CYAN}"
echo "=========================================================="
echo "          MakeUsSparkle - Updating Application            "
echo "=========================================================="
echo -e "${NC}"

# ------------------------------------------------------------------------------
# 1. Pull Latest Changes from Git
# ------------------------------------------------------------------------------
log_info "Fetching and pulling latest code from Git..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
log_info "Active branch: $CURRENT_BRANCH"

git fetch origin "$CURRENT_BRANCH"
git pull origin "$CURRENT_BRANCH"
log_success "Code updated to latest commit."

# ------------------------------------------------------------------------------
# 2. Update Backend
# ------------------------------------------------------------------------------
log_info "Updating Backend dependencies..."
cd "$REPO_DIR/backend"
npm install --omit=dev || npm install
log_success "Backend ready."

# ------------------------------------------------------------------------------
# 3. Update Frontend
# ------------------------------------------------------------------------------
log_info "Updating Frontend dependencies..."
cd "$REPO_DIR/frontend"

# Ensure NEXT_PUBLIC_API_URL is properly configured for production
if [ ! -f ".env.production" ]; then
  cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.makeyousparkle.in
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RmCmc4bECn3PRU
EOF
fi

npm install

log_info "Building Next.js Frontend bundle..."
npm run build
log_success "Frontend build completed."

# ------------------------------------------------------------------------------
# 4. Reload PM2 Services (Zero Downtime)
# ------------------------------------------------------------------------------
cd "$REPO_DIR"

log_info "Reloading PM2 services..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env || pm2 restart ecosystem.config.cjs --update-env
  pm2 save
  log_success "PM2 services reloaded."
else
  log_error "PM2 is not installed or not in PATH!"
  exit 1
fi

# ------------------------------------------------------------------------------
# 5. Reload Nginx (Optional check)
# ------------------------------------------------------------------------------
if command -v nginx >/dev/null 2>&1; then
  if [ "$EUID" -eq 0 ]; then
    nginx -t && systemctl reload nginx || true
  elif command -v sudo >/dev/null 2>&1; then
    sudo nginx -t && sudo systemctl reload nginx || true
  fi
fi

# ------------------------------------------------------------------------------
# 6. Status Output
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}          UPDATE COMPLETED SUCCESSFULLY!                 ${NC}"
echo -e "${GREEN}==========================================================${NC}"
echo ""
pm2 status
echo ""
log_info "To view live logs: pm2 logs"
