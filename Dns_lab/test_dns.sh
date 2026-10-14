#!/usr/bin/env bash
# ==============================================================================
# SCRIPT KIỂM TRA PHÂN GIẢI MÁY CHỦ DNS LAB
# ==============================================================================

DNS_IP="127.0.0.1"
DNS_PORT="5353"

echo "=========================================================="
echo "  BẮT ĐẦU KIỂM TRA MÁY CHỦ DNS LAB ($DNS_IP:$DNS_PORT)"
echo "=========================================================="
echo ""

check_record() {
    local domain=$1
    local type=$2
    echo -n "[*] Đang kiểm tra $type của '$domain' ... "
    res=$(dig @$DNS_IP -p $DNS_PORT "$domain" "$type" +short)
    if [ -n "$res" ]; then
        echo -e "\033[0;32m[THÀNH CÔNG]\033[0m -> $res"
    else
        echo -e "\033[0;31m[THẤT BẠI]\033[0m"
    fi
}

# 1. Kiểm tra các bản ghi A nội bộ
check_record "auth.mmq.khanh" "A"
check_record "mail.mmq.khanh" "A"
check_record "login.microsoft-sso.mmq-portal.cloud" "A"

# 2. Kiểm tra bản ghi TXT
check_record "mmq.khanh" "TXT"

# 3. Kiểm tra tính năng chuyển tiếp ra Internet (Upstream Forwarding)
echo ""
echo "[*] Kiểm tra chuyển tiếp Internet (Upstream Forwarding tới 1.1.1.1)..."
check_record "cloudflare.com" "A"

echo ""
echo "=========================================================="
echo "  HOÀN TẤT KIỂM TRA"
echo "=========================================================="
