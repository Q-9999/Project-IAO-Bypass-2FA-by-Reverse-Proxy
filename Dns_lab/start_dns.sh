#!/usr/bin/env bash
# ==============================================================================
# SCRIPT KHỞI ĐỘNG DNS SERVER LAB 
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$DIR/dnsmasq.conf"

echo "=========================================================="
echo "  KHỞI ĐỘNG MÁY CHỦ DNS LAB (dnsmasq) TẠI CỔNG 5353"
echo "  Ctrl + C để dừng máy chủ"
echo "=========================================================="
echo ""

# Chạy ở chế độ -d (foreground debug) để hiển thị chi tiết các request DNS gửi tới
dnsmasq -C "$CONFIG_FILE" -d
