# Thư Mục Dns_lab: Môi Trường Thực Nghiệm Nội Bộ (Internal Dry Run)

Thư mục này đóng vai trò là **Sandbox thử nghiệm cô lập (Isolated Dry Run)** trên dải mạng Loopback / Private IP (`127.0.0.1`), giúp nhóm kiểm thử toàn diện cơ chế định tuyến tên miền và giao diện ứng dụng trước khi triển khai công khai ra Internet qua FreeDomain.

---

## 1. Ý Nghĩa & Vai Trò Trong Dự Án AiTM

Trong một cuộc tấn công AiTM thực tế, **DNS là chìa khóa điều hướng**: Nếu DNS không trỏ đúng tên miền về máy chủ Reverse Proxy, toàn bộ cuộc tấn công sẽ thất bại ngay từ bước đầu.

Thay vì đưa ngay lên Internet (tiềm ẩn rủi ro lộ hạ tầng, khó gỡ lỗi và phụ thuộc vào tốc độ lan truyền DNS toàn cầu), `Dns_lab` cho phép:
1. **Kiểm thử phân giải đa bản ghi (A, TXT, Upstream Forwarding):** Đảm bảo máy chủ phản hồi đúng địa chỉ IP mong muốn cho các domain giả định (`mail.mmq.khanh`, `auth.mmq.khanh`, `login.microsoft-sso.mmq-portal.cloud`).
2. **Kiểm thử hành vi trình duyệt:** Xác minh trình duyệt nhận diện domain và gửi request HTTP về đúng web server.
3. **Mô phỏng trải nghiệm người dùng (Victim Experience):** Chạy thử giao diện đăng nhập Microsoft SSO chuẩn Fluent Design để đo lường mức độ chân thực trước khi cấu hình Phishlet.

---

## 2. Danh Sách & Chức Năng Các Thành Phần

| Tên File | Vai trò kỹ thuật | Chi tiết hoạt động |
| :--- | :--- | :--- |
| [`dnsmasq.conf`](dnsmasq.conf) | Cấu hình máy chủ DNS | Chạy cổng `5353` (tránh xung đột cổng 53 hệ thống), cấu hình bản ghi A cho MMQ portal, bản ghi TXT/SPF, và chuyển tiếp truy vấn Internet tới Cloudflare `1.1.1.1`. |
| [`start_dns.sh`](start_dns.sh) | Script khởi động DNS | Chạy `dnsmasq -d` ở chế độ Foreground Debug, in trực tiếp mọi gói tin DNS Query/Response ra màn hình theo thời gian thực. |
| [`stop_dns.sh`](stop_dns.sh) | Script dừng DNS | Tìm và tắt an toàn tiến trình `dnsmasq` đang lắng nghe cổng 5353. |
| [`test_dns.sh`](test_dns.sh) | Script kiểm tra tự động | Sử dụng lệnh `dig` kiểm tra lần lượt các bản ghi A, TXT và chuyển tiếp Internet, xuất kết quả trực quan [THÀNH CÔNG] / [THẤT BẠI]. |
| [`start_web.sh`](start_web.sh) | Khởi động máy chủ Web | Mở Web Server trên cổng 80 phục vụ trang đích. |
| [`index.html`](index.html) | Giao diện Microsoft SSO | Thiết kế chuẩn Fluent Design với đầy đủ logo 4 màu SVG, font Segoe UI, và luồng tương tác đa bước: Nhập Email ➔ Nhập Pass ➔ Mô phỏng phê duyệt MFA (Microsoft Authenticator Number Matching). |

---

## 3. Quy Trình Chạy Thử Nghiệm Nội Bộ (Dry Run Walkthrough)

1. **Bước 1: Khởi động máy chủ DNS**
   ```bash
   ./start_dns.sh
   ```
2. **Bước 2: Kiểm tra phân giải bản ghi (mở terminal mới)**
   ```bash
   ./test_dns.sh
   ```
3. **Bước 3: Ghi nhận tên miền nội bộ vào hệ điều hành**
   ```bash
   echo "127.0.0.1 login.microsoft-sso.mmq-portal.cloud" | sudo tee -a /etc/hosts
   ```
4. **Bước 4: Bật web server và trải nghiệm trên trình duyệt**
   ```bash
   ./start_web.sh
   ```
   Mở trình duyệt truy cập: `http://login.microsoft-sso.mmq-portal.cloud`
