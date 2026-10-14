# Solution & Write-up: [FORENSICS] The Encrypted Phantom

- **Flag:** `MMQ{TLS_4iTM_d3crypt3d_s3ss10n_st0l3n_2026}`

## 1. Phân tích hiện trạng gói tin
- Mở file `traffic_tls.pcap` bằng Wireshark thông thường:
  - Tất cả các gói tin đều hiển thị là giao thức `TLSv1.3` (Application Data).
  - Không có bất kỳ dữ liệu HTTP nào đọc được ở dạng rõ (plaintext).
  - Lệnh `strings traffic_tls.pcap | grep MMQ` không đem lại kết quả do toàn bộ tải trọng đã bị mã hóa.

## 2. Nạp khóa phiên giải mã TLS (Pre-Master Secret)
1. Trong Wireshark, chọn menu: `Edit` $\to$ `Preferences...`
2. Mở mục: `Protocols` $\to$ `TLS`.
3. Tại dòng `(Pre)-Master-Secret log filename`, nhấn `Browse...` và chọn file `sslkeylog.log`.
4. Nhấn `OK`.
5. Ngay lập tức, Wireshark giải mã các luồng TLS và hiển thị giao thức HTTP/1.1 bên dưới.

## 3. Khảo sát luồng tấn công AiTM sau giải mã
- **Bước 1 (Đăng nhập):** Nạn nhân gửi request tới `/common/login` với tài khoản:
  - Username: `giamdoc.lan@mmq.corp`
  - Password: `GiamDocLan@2026#Vip!`
- **Bước 2 (Xác thực 2 bước):** Máy chủ trả về yêu cầu Number Matching với số hiển thị `94`. Nạn nhân xác nhận thành công tại `/common/mfa-verify`.
- **Bước 3 (Đánh cắp Cookie):** Máy chủ cấp 2 cookie nhạy cảm: `ESTSAUTH` và `MMQ_EXECUTIVE_TOKEN`.
- **Bước 4 (Trích xuất dữ liệu):** Kẻ tấn công dùng token đã trộm gửi request tới:
  ```http
  POST /api/v3/executive/vault_export HTTP/1.1
  Host: login.microsoft-sso.mmq-portal.cloud
  Cookie: ESTSAUTH=...; MMQ_EXECUTIVE_TOKEN=...
  ```
- Máy chủ phản hồi JSON chứa dữ liệu mật:
  ```json
  {
    "status": "success",
    "vault_name": "Executive_Strategy_2026",
    "secret_flag": "MMQ{TLS_4iTM_d3crypt3d_s3ss10n_st0l3n_2026}"
  }
  ```

## 4. Tự động kiểm tra
```bash
python3 solve.py
```
*(Script tự động gọi tshark với tùy chọn `tls.keylog_file` và xuất cờ).*
