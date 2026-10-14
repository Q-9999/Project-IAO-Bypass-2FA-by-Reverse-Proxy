# Solution & Write-up: [FORENSICS] Chiếc Vé Đánh Cắp (Stolen Bearer)

- **Flag:** `MMQ{JWT_r3fr3sh_t0k3n_r2pl4y_3sc4l4t10n_2026}`

## 1. Phân tích SIEM Alerts (`siem_alerts.json`)
- Alert 1: Nạn nhân `lan.hieu@mmq.khanh` xác thực qua proxy hosting `104.28.19.42`.
- Alert 2: Khoảng 20 phút sau, IP lạ `194.26.29.112` gửi yêu cầu cấp lại token bằng refresh token bị lộ: `RT_MMQ_REFRESH_9381024_AITM_STOLEN` với scope leo thang: `Vault.Admin.Export`.

## 2. Phân tích lưu lượng gói tin (`audit_trace.pcap`)
- Gói 4 & 6: Proxy gửi `authorization_code` đổi lấy `access_token` và `refresh_token`.
- Gói 14 & 16: Kẻ tấn công từ IP `194.26.29.112` dùng refresh token lấy `access_token` mới có quyền `Vault.Admin.Export`.
- Gói 18: Kẻ tấn công gửi request với Header:
  ```http
  POST /api/v2/vault/export-data HTTP/1.1
  Host: vault.mmq.corp
  Authorization: Bearer <escalated_token>
  ```
- Gói 20: Máy chủ trả về JSON:
  ```json
  {
    "status": "success",
    "encrypted_export_payload": "TU1Re0pXVF9yM2ZyM3NoX3QwazNuX3IycGw0eV8zc2M0bDR0MTBuXzIwMjZ9"
  }
  ```

## 3. Trích xuất Flag
Giải mã Base64 chuỗi `encrypted_export_payload`:
```bash
echo "TU1Re0pXVF9yM2ZyM3NoX3QwazNuX3IycGw0eV8zc2M0bDR0MTBuXzIwMjZ9" | base64 -d
```

## Tự động kiểm tra
```bash
python3 solve.py
```
