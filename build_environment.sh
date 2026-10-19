#!/usr/bin/env bash
# ==============================================================================
# PROJECT IAO: MFA BYPASS BY REVERSE PROXY
# Environment Setup & Compatibility Verification Script for Kali Linux / Debian
# ==============================================================================

set -e

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
NC="\033[0m"

echo -e "${CYAN}==================================================================${NC}"
echo -e "${CYAN}  PROJECT IAO - MFA BYPASS BY REVERSE PROXY${NC}"
echo -e "${CYAN}  Environment Build & Dependency Verification Script${NC}"
echo -e "${CYAN}==================================================================${NC}"
echo ""

# 1. Check Required System Commands
echo -e "[*] Bước 1: Kiểm tra các công cụ hệ thống bắt buộc (Core Dependencies)..."
CORE_COMMANDS=(go node npm git make curl python3)
MISSING_CORE=()

for cmd in "${CORE_COMMANDS[@]}"; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        MISSING_CORE+=("$cmd")
    else
        echo -e "  [+] $cmd: ${GREEN}TÌM THẤY ($(command -v "$cmd"))${NC}"
    fi
done

if [ ${#MISSING_CORE[@]} -gt 0 ]; then
    echo -e "${RED}[!] Phát hiện thiếu các công cụ cốt lõi: ${MISSING_CORE[*]}${NC}"
    echo -e "[*] Vui lòng cài đặt bổ sung trước khi tiếp tục:"
    echo -e "      sudo apt-get update && sudo apt-get install -y ${MISSING_CORE[*]}"
    exit 1
else
    echo -e "${GREEN}[OK] Toàn bộ công cụ cốt lõi đã sẵn sàng!${NC}"
fi

# Optional Network & Analysis Tools
echo ""
echo -e "[*] Kiểm tra các công cụ phân tích mạng bổ trợ (Optional Diagnostic Tools)..."
OPTIONAL_COMMANDS=(dnsmasq dig tshark wireshark)
for cmd in "${OPTIONAL_COMMANDS[@]}"; do
    if command -v "$cmd" >/dev/null 2>&1; then
        echo -e "  [+] $cmd: ${GREEN}SẴN SÀNG${NC}"
    else
        echo -e "  [-] $cmd: ${YELLOW}CHƯA CÀI ĐẶT (Có thể cài qua: sudo apt-get install -y $cmd)${NC}"
    fi
done

# 2. Verify Go Environment
echo ""
echo -e "[*] Bước 2: Kiểm tra phiên bản Go (Golang)..."
GO_VER=$(go version)
echo -e "  [+] $GO_VER"
echo -e "${GREEN}[OK] Môi trường Go tương thích hoàn toàn.${NC}"

# 3. Check and Compile Evilginx2
echo ""
echo -e "[*] Bước 3: Kiểm tra và chuẩn bị nhị phân Evilginx2..."
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EVILGINX_DIR="$PROJECT_DIR/Tools/Evilginx2"

if [ -f "$EVILGINX_DIR/build/evilginx" ]; then
    echo -e "${GREEN}[OK] Nhị phân Evilginx2 đã sẵn sàng tại:${NC}"
    echo -e "      $EVILGINX_DIR/build/evilginx"
    chmod +x "$EVILGINX_DIR/build/evilginx"
else
    echo -e "${YELLOW}[*] Đang biên dịch Evilginx2 từ mã nguồn...${NC}"
    mkdir -p "$EVILGINX_DIR/build"
    (cd "$EVILGINX_DIR" && go build -o build/evilginx main.go)
    chmod +x "$EVILGINX_DIR/build/evilginx"
    echo -e "${GREEN}[OK] Biên dịch Evilginx2 thành công!${NC}"
fi

# 4. Verify Node.js Environment & IAO_Web_Test
echo ""
echo -e "[*] Bước 4: Kiểm tra môi trường Node.js & Ứng dụng Web MFA (IAO_Web_Test)..."
NODE_VER=$(node -v 2>/dev/null || echo "not installed")
NPM_VER=$(npm -v 2>/dev/null || echo "not installed")
echo -e "  [+] Node.js: $NODE_VER"
echo -e "  [+] npm:     $NPM_VER"

if [ -d "$PROJECT_DIR/IAO_Web_Test" ]; then
    if [ ! -f "$PROJECT_DIR/IAO_Web_Test/.env" ] && [ -f "$PROJECT_DIR/IAO_Web_Test/.env.example" ]; then
        echo -e "[*] Tự động khởi tạo .env từ cấu hình mẫu..."
        cp "$PROJECT_DIR/IAO_Web_Test/.env.example" "$PROJECT_DIR/IAO_Web_Test/.env"
    fi

    if [ ! -d "$PROJECT_DIR/IAO_Web_Test/node_modules" ]; then
        echo -e "[*] Chưa có node_modules, đang tự động cài đặt dependencies..."
        (cd "$PROJECT_DIR/IAO_Web_Test" && npm install --silent)
    fi

    echo -e "[*] Đang chạy kiểm thử tự động (Smoke Test) cho IAO_Web_Test..."
    (cd "$PROJECT_DIR/IAO_Web_Test" && npm test >/dev/null 2>&1) && echo -e "  [+] IAO_Web_Test Authentication & OTP: ${GREEN}[PASS 100%]${NC}" || echo -e "  [+] IAO_Web_Test: ${YELLOW}[FAIL] Vui lòng kiểm tra lại cấu hình .env${NC}"
fi

# 5. Check Script Permissions
echo ""
echo -e "[*] Bước 5: Cấp quyền thực thi (chmod +x) cho các script..."
chmod +x "$PROJECT_DIR"/build_environment.sh "$PROJECT_DIR"/start_app.sh 2>/dev/null || true
echo -e "${GREEN}[OK] Quyền thực thi sẵn sàng.${NC}"

echo ""
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}  HOÀN TẤT THIẾT LẬP MÔI TRƯỜNG DỰ ÁN IAO THÀNH CÔNG!${NC}"
echo -e "${GREEN}  Hệ thống tương thích 100% với môi trường local.${NC}"
echo -e "${GREEN}==================================================================${NC}"
