#!/usr/bin/env bash
# ==============================================================================
# SCRIPT KHỞI ĐỘNG WEB SERVER GIẢ LẬP TẠI CỔNG 80
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo "  KHỞI ĐỘNG MÁY CHỦ WEB DEMO (PORT 80)"
echo "  Mở trình duyệt truy cập: http://login.microsoft-sso.mmq-portal.cloud"
echo "  Ctrl + C để dừng máy chủ bất cứ lúc nào "
echo "=========================================================="
echo ""

sudo python3 -m http.server 80 --directory "$DIR"
