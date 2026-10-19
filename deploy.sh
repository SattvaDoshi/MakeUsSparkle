#!/usr/bin/env bash
# ==============================================================================
# MakeUsSparkle - Initial Server Setup & Deployment Script
# Target: Hostinger VPS (Ubuntu / Debian)
# Domains:
#   - Frontend : makeyousparkle.in (and www.makeyousparkle.in)
#   - Backend  : api.makeyousparkle.in
# ==============================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# ------------------------------------------------------------------------------
# 1. Root / Sudo Check
# ------------------------------------------------------------------------------
if [ "$EUID" -ne 0 ]; then
  log_error "Please run this script as root or with sudo:"
  echo "  sudo bash deploy.sh"
  exit 1
fi

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

echo -e "${BLUE}"
echo "=========================================================="
echo "   MakeUsSparkle VPS Deployment - Hostinger Ubuntu/Debian "
echo "=========================================================="
echo -e "${NC}"
log_info "Working directory: $REPO_DIR"

# ------------------------------------------------------------------------------
# 2. System Packages & Dependencies
# ------------------------------------------------------------------------------
log_info "Updating system packages..."
apt-get update -y

log_info "Installing essential packages (curl, git, build-essential, ufw, nginx, certbot)..."
apt-get install -y curl git build-essential ufw nginx certbot python3-certbot-nginx

# ------------------------------------------------------------------------------
# 3. Node.js (Node 20.x LTS) & PM2 Installation
# ------------------------------------------------------------------------------
NEED_NODE=0
if ! command -v node >/dev/null 2>&1; then
  NEED_NODE=1
else
  NODE_MAJOR=$(node -v | cut -d'.' -f1 | sed 's/v//')
  if [ "$NODE_MAJOR" -lt 20 ]; then
    log_warn "Current Node.js version is v$NODE_MAJOR. Next.js 16 requires Node 20+."
    NEED_NODE=1
  fi
fi

if [ "$NEED_NODE" -eq 1 ]; then
  log_info "Installing Node.js 20.x LTS from NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

log_success "Node.js $(node -v) and npm $(npm -v) are ready."

if ! command -v pm2 >/dev/null 2>&1; then
  log_info "Installing PM2 globally..."
  npm install -g pm2
else
  log_info "PM2 is already installed ($(pm2 -v))."
fi

# ------------------------------------------------------------------------------
# 4. Backend Setup
# ------------------------------------------------------------------------------
log_info "Setting up Backend..."
if [ ! -d "$REPO_DIR/backend" ]; then
  log_error "Backend directory not found at $REPO_DIR/backend!"
  exit 1
fi

cd "$REPO_DIR/backend"

if [ ! -f ".env" ]; then
  log_warn ".env file was not found in $REPO_DIR/backend!"
  if [ -f ".env.example" ]; then
    log_info "Creating .env from .env.example as a placeholder. Please update with your real secrets!"
    cp .env.example .env
  else
    touch .env
  fi
else
  log_success "Backend .env file found."
fi

# Ensure FRONTEND_URL & CORS_ORIGINS include the production domain
sed -i 's|FRONTEND_URL=http://localhost:3000|FRONTEND_URL=https://makeyousparkle.in|g' .env 2>/dev/null || true
if ! grep -q "FRONTEND_URL=" .env; then
  echo "" >> .env
  echo "FRONTEND_URL=https://makeyousparkle.in" >> .env
fi

if ! grep -q "CORS_ORIGINS=" .env; then
  echo "CORS_ORIGINS=https://makeyousparkle.in,https://www.makeyousparkle.in" >> .env
fi

log_info "Installing Backend dependencies..."
npm install --omit=dev || npm install

log_success "Backend dependencies installed successfully."

# ------------------------------------------------------------------------------
# 5. Frontend Setup
# ------------------------------------------------------------------------------
log_info "Setting up Frontend..."
if [ ! -d "$REPO_DIR/frontend" ]; then
  log_error "Frontend directory not found at $REPO_DIR/frontend!"
  exit 1
fi

cd "$REPO_DIR/frontend"

# Configure frontend production environment variables
log_info "Configuring frontend .env.production with API URL: https://api.makeyousparkle.in"
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.makeyousparkle.in
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RmCmc4bECn3PRU
EOF

log_info "Installing Frontend dependencies..."
npm install

log_info "Building Next.js Frontend for production..."
npm run build

log_success "Frontend built successfully."

# ------------------------------------------------------------------------------
# 6. PM2 Process Manager Configuration
# ------------------------------------------------------------------------------
cd "$REPO_DIR"

log_info "Starting / Reloading processes with PM2..."
pm2 startOrReload ecosystem.config.cjs --update-env

# Save current PM2 processes so they survive reboot
pm2 save

# Setup PM2 startup systemd service
REAL_USER="${SUDO_USER:-root}"
USER_HOME=$(getent passwd "$REAL_USER" | cut -d: -f6)

if [ "$REAL_USER" != "root" ] && [ -n "$USER_HOME" ]; then
  env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u "$REAL_USER" --hp "$USER_HOME" || true
else
  pm2 startup systemd -u root --hp /root || true
fi

log_success "PM2 processes started and saved."

# ------------------------------------------------------------------------------
# 7. Nginx Reverse Proxy Configuration
# ------------------------------------------------------------------------------
log_info "Configuring Nginx reverse proxy..."

NGINX_CONF="/etc/nginx/sites-available/makeyousparkle.conf"

cat > "$NGINX_CONF" << 'EOF'
# ==========================================
# Frontend: makeyousparkle.in & www.makeyousparkle.in
# ==========================================
server {
    listen 80;
    listen [::]:80;
    server_name makeyousparkle.in www.makeyousparkle.in;

    client_max_body_size 50M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # Cache Next.js Static Assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_bypass $http_upgrade;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Cache public images & media
    location ~* \.(?:ico|css|js|gif|jpe?g|png|webp|svg|woff2?|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ==========================================
# Backend API: api.makeyousparkle.in
# ==========================================
server {
    listen 80;
    listen [::]:80;
    server_name api.makeyousparkle.in;

    client_max_body_size 50M;

    # Gzip Compression for JSON responses
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types application/json;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site if not already enabled
if [ ! -f /etc/nginx/sites-enabled/makeyousparkle.conf ]; then
  ln -sf /etc/nginx/sites-available/makeyousparkle.conf /etc/nginx/sites-enabled/
fi

# Remove default nginx site if active
if [ -f /etc/nginx/sites-enabled/default ]; then
  rm -f /etc/nginx/sites-enabled/default
fi

# Test Nginx syntax
nginx -t

# Reload Nginx
systemctl restart nginx
log_success "Nginx configured and restarted."

# ------------------------------------------------------------------------------
# 8. Firewall (UFW)
# ------------------------------------------------------------------------------
log_info "Configuring UFW firewall rules..."
ufw allow OpenSSH || ufw allow 22
ufw allow 'Nginx Full' || (ufw allow 80 && ufw allow 443)
ufw --force enable || true
log_success "Firewall configured."

# ------------------------------------------------------------------------------
# 9. SSL Certificate Setup (Let's Encrypt / Certbot)
# ------------------------------------------------------------------------------
echo ""
echo -e "${YELLOW}----------------------------------------------------------${NC}"
echo -e "${YELLOW}               SSL / HTTPS Configuration                  ${NC}"
echo -e "${YELLOW}----------------------------------------------------------${NC}"
echo "Make sure your DNS records in Hostinger point to this VPS IP:"
echo "  A record : makeyousparkle.in     -> YOUR_VPS_IP"
echo "  A record : www.makeyousparkle.in -> YOUR_VPS_IP"
echo "  A record : api.makeyousparkle.in -> YOUR_VPS_IP"
echo ""

read -p "Have you already pointed your DNS records to this VPS? (y/N): " -r DNS_READY
if [[ $DNS_READY =~ ^[Yy]$ ]]; then
  read -p "Enter your email for Let's Encrypt renewal notices: " -r SSL_EMAIL
  if [ -n "$SSL_EMAIL" ]; then
    log_info "Requesting SSL certificates from Certbot..."
    certbot --nginx -d makeyousparkle.in -d www.makeyousparkle.in -d api.makeyousparkle.in \
      --non-interactive --agree-tos -m "$SSL_EMAIL" --redirect || {
      log_warn "Certbot encountered an error. You can run it manually anytime with:"
      echo "  sudo certbot --nginx -d makeyousparkle.in -d www.makeyousparkle.in -d api.makeyousparkle.in"
    }
  fi
else
  log_info "Skipping automatic SSL for now."
  echo "Once your DNS records propagate, run this single command to secure both domains:"
  echo -e "${GREEN}  sudo certbot --nginx -d makeyousparkle.in -d www.makeyousparkle.in -d api.makeyousparkle.in${NC}"
fi

# ------------------------------------------------------------------------------
# 10. Summary & Completion
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}          DEPLOYMENT COMPLETED SUCCESSFULLY!             ${NC}"
echo -e "${GREEN}==========================================================${NC}"
echo ""
echo "  Frontend URL : http://makeyousparkle.in (or https if SSL enabled)"
echo "  Backend API  : http://api.makeyousparkle.in (or https if SSL enabled)"
echo ""
echo "Helpful PM2 Commands:"
echo "  pm2 status          - Check status of all running apps"
echo "  pm2 logs            - View live server logs"
echo "  pm2 restart all     - Restart backend & frontend"
echo ""
echo "Future Updates:"
echo "  Whenever you push new code to Git, run:"
echo -e "${CYAN}  ./update.sh${NC}"
echo ""
