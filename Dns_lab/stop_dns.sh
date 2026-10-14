#!/usr/bin/env bash
# ==============================================================================
# SCRIPT DỪNG MÁY CHỦ DNS LAB
# ==============================================================================

echo "[*] Đang tìm tiến trình dnsmasq lab..."
PIDS=$(pgrep -f "dnsmasq.*dnsmasq.conf")

if [ -z "$PIDS" ]; then
    echo "[!] Không tìm thấy tiến trình DNS lab nào đang chạy."
else
    echo "[*] Đang dừng tiến trình PID: $PIDS ..."
    kill $PIDS 2>/dev/null
    sleep 1
    if pgrep -f "dnsmasq.*dnsmasq.conf" >/dev/null; then
        kill -9 $PIDS 2>/dev/null
    fi
    echo -e "\033[0;32m[THÀNH CÔNG]\033[0m Máy chủ DNS lab đã được dừng."
fi
