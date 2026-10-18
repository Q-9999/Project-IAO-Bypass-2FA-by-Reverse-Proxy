#!/usr/bin/env bash
# ==============================================================================
# PROJECT IAO: Khởi động nhanh ứng dụng Web MFA (Northgate)
# ==============================================================================
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$PROJECT_DIR/IAO_Web_Test"

echo "=================================================================="
echo "  PROJECT IAO - STARTING MFA WEB APP"
echo "=================================================================="

# 1. Tự động khởi tạo .env nếu chưa tồn tại
if [ ! -f "$APP_DIR/.env" ] && [ -f "$APP_DIR/.env.example" ]; then
    echo "[*] Phát hiện chưa có .env, tự động cấu hình từ .env.example..."
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
fi

cd "$APP_DIR"

# 2. Tự động cài đặt dependencies nếu chưa có
if [ ! -d "node_modules" ]; then
    echo "[*] Chưa có node_modules, đang tự động chạy npm install..."
    npm install
fi

# 3. Chạy ứng dụng ở chế độ dev
echo "[*] Ứng dụng sẵn sàng! Đang khởi động tại: http://localhost:3000"
echo "    Nhấn Ctrl+C để dừng ứng dụng."
npm run dev
