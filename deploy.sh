#!/usr/bin/env bash
# =========================================================
# PolyPack Billing - Automated VPS Deployment Script
# Usage: ./deploy.sh
# =========================================================

set -e # Exit immediately on any error

echo "=================================================="
echo "🚀 Deploying PolyPack Billing to Production VPS..."
echo "=================================================="

# 1. Pull the latest code from GitHub
echo ""
echo "📥 Step 1/5: Pulling latest changes from GitHub..."
git pull origin main

# 2. Check / create server/.env if missing
echo ""
echo "⚙️ Step 2/5: Verifying server environment configuration..."
if [ ! -f "server/.env" ]; then
    echo "Creating default server/.env for local VPS MongoDB on port 5025..."
    mkdir -p server
    cat << 'EOF' > server/.env
PORT=5025
MONGODB_URI=mongodb://127.0.0.1:27017/polybag_billing
EOF
    echo "✅ server/.env created."
else
    echo "✅ server/.env already exists."
fi

# 3. Install dependencies
echo ""
echo "📦 Step 3/5: Installing npm dependencies..."
npm install

# 4. Build frontend production assets
echo ""
echo "🔨 Step 4/5: Building optimized frontend assets (dist/)..."
npm run build

# 5. Start or reload application via PM2
echo ""
echo "🔄 Step 5/5: Reloading application in PM2..."
if pm2 describe polybag-billing > /dev/null 2>&1; then
    pm2 reload ecosystem.config.cjs --update-env || pm2 restart polybag-billing
else
    pm2 start ecosystem.config.cjs
fi

pm2 save

echo ""
echo "=================================================="
echo "✅ Deployment completed successfully!"
echo "🌐 URL: https://polybag-billing.gemshine.tech"
echo "🔌 Internal Port: 5025"
echo "=================================================="

# Optional status check
echo "Checking backend status..."
sleep 2
curl -s http://127.0.0.1:5025/api/status || echo "Server is starting up..."
echo ""
