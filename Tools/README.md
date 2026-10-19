# Thư Mục Tools: Bộ Công Cụ Nghiên Cứu AiTM & Proxy

Thư mục này chứa công cụ chuyên dụng phục vụ nghiên cứu kỹ thuật **Adversary-in-the-Middle** nhằm phân tích cơ chế vượt qua xác thực đa yếu tố (MFA Bypass) và đề xuất giải pháp phòng thủ.

---

## 1. Danh Sách & Chức Năng Chi Tiết Tools

### 🔹 1. Evilginx2 (`Tools/Evilginx2/`)
* **Chức năng:** Là một máy chủ Reverse Proxy độc lập (viết bằng Golang). Khác với các trang phishing truyền thống là trang giả mạo giao diện đăng nhập (chỉ là trang tĩnh và không thể xử lý được mã OTP động), Evilginx hoạt động như một proxy trung gian **trong suốt | Transparent Proxy** đứng giữa Client và Máy chủ xác thực   
* **Cơ chế bypass MFA (Session Theft):**
  1. Khi người dùng gửi yêu cầu đăng nhập, Evilginx chuyển tiếp ngay lập tức lên máy chủ thật.
  2. Máy chủ thật yêu cầu xác thực yếu tố thứ 2 (MFA: OTP qua email). Evilginx chuyển tiếp yêu cầu này về trình duyệt của người dùng.
  3. Người dùng nhập mã OTP thật nhận được từ email.
  4. Máy chủ thật xác nhận thành công và cấp phát **Session Cookie** (ví dụ: cookie `sid` của ứng dụng Northgate).
  5. Evilginx bắt trọn Session Cookie này và lưu vào cơ sở dữ liệu SQLite trước khi chuyển tiếp người dùng về trang đích. Kẻ tấn công nạp Session Cookie này vào trình duyệt để đăng nhập thẳng vào hệ thống mà không cần xác thực lại mật khẩu hay OTP.
* **Execute file:** `Tools/Evilginx2/build/evilginx`.

---

### 🔹 2. Phishlets (`Tools/Evilginx2/phishlets/`)
* **Chức năng:** Các tệp kịch bản định dạng YAML quy định hành vi can thiệp của Evilginx đối với từng mục tiêu.
* **Các thành phần cốt lõi của một Phishlet:**
  - `proxy_hosts`: Định nghĩa Original Domain và Phish Domain.
  - `credentials`: Regex | trích xuất user/email và passwd từ yêu cầu JSON API hoặc form POST.
  - `auth_tokens`: Cookie / Token session cần đánh cắp để vượt qua MFA.
  - `login`: Đường dẫn trang đăng nhập để chuyển hướng người dùng khi mở lure link.
* **Danh sách phishlets :**
  - `demo.yaml`: Phishlet cho [IAO_Web_Test](../IAO_Web_Test), trích xuất `identifier`, `password` từ payload JSON và bắt giữ session cookie `sid`.
  - `example.yaml`: Phishlet mẫu của framework.
  - `Linkedin.yaml`: Phishlet mẫu nghiên cứu mạng xã hội.
  - `microsoftoffice365ADFS.yaml`: Phishlet mẫu nghiên cứu hệ thống Microsoft SSO / Entra ID. 

---
