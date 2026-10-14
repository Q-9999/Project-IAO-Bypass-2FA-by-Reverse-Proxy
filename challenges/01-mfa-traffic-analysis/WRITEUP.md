# Solution & Write-up: [FORENSICS] Kẻ Đứng Giữa

- **Flag:** `MMQ{4iTM_r3v3rs3_pr0xy_s3ss10n_th3ft_d3f34t3d_2026}`

## 1. Phân tích lưu lượng HTTP
Mở file `capture.pcap` bằng Wireshark hoặc `tshark`:
- Nạn nhân (`192.168.1.105`) truy cập tên miền giả mạo `auth-portal.mmq-corp.cloud` (đóng vai trò là Reverse Proxy AiTM).
- Nạn nhân nhập thông tin đăng nhập:
  - **Username:** `lan.hieu@mmq.khanh`
  - **Password:** `LanHieu@2026#Sec`
- Nạn nhân nhập mã OTP `839201`. Proxy chuyển tiếp yêu cầu và nhận về phiên làm việc:
  - **Cookie:** `MMQ_SSO_SESSION=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibGFuLmhpZXUiLCJyb2xlIjoiZmluYW5jZV9tYW5hZ2VyIiwiaWF0IjoxNzkyMTQwMDB9.3e8b4f1c9`

## 2. Phát hiện hành vi sử dụng trái phép Token (Session Theft)
- Khoảng 10 phút sau, IP lạ `45.145.67.89` gửi request đến máy chủ nội bộ `portal.mmq.khanh` mang theo đúng cookie `MMQ_SSO_SESSION` đã bị đánh cắp ở trên:
  ```http
  GET /api/v1/vault/confidential_report.zip HTTP/1.1
  Host: portal.mmq.khanh
  Cookie: MMQ_SSO_SESSION=...
  ```
- Máy chủ trả về file đính kèm `confidential_report.zip`.

## 3. Trích xuất file và giải mã Flag
1. Dùng Wireshark: Chọn `File` -> `Export Objects` -> `HTTP...` -> Lưu file `confidential_report.zip`.
   *(Hoặc dùng lệnh: `tshark -r capture.pcap --export-objects http,./export`)*
2. File zip bị khóa mật khẩu. Mật khẩu chính là mật khẩu của nạn nhân đã bị lộ trong luồng proxy: `LanHieu@2026#Sec`.
3. Giải nén file:
   ```bash
   unzip -P 'LanHieu@2026#Sec' confidential_report.zip
   cat flag_export.txt
   ```

## Tự động kiểm tra
```bash
python3 solve.py
```
