# Thư Mục Tools: Bộ Công Cụ Cốt Lõi Tấn Công AiTM & DNS

Thư mục này tập hợp các công cụ chuyên dụng phục vụ kỹ thuật **Adversary-in-the-Middle (AiTM)** nhằm vượt qua cơ chế xác thực đa yếu tố (MFA).

---

## 1. Danh Sách & Chức Năng Chi Tiết Các Công Cụ

### 🔹 1. Evilginx2 (`Tools/Evilginx2/`)
* **Bản chất kỹ thuật:** Là một máy chủ Reverse Proxy độc lập (viết bằng Golang). Khác với các trang phishing truyền thống (vốn chỉ sao chép mã nguồn giao diện HTML tĩnh và không xử lý được MFA), Evilginx hoạt động như một lớp proxy trung gian hoàn toàn **trong suốt (Transparent Proxy)** đứng giữa Nạn nhân (Victim) và Máy chủ xác thực thật (Real Identity Provider - IdP như Microsoft, Google, Okta).
* **Cơ chế vượt MFA (Session Theft):**
  1. Khi nạn nhân nhập tài khoản và mật khẩu, Evilginx chuyển tiếp ngay lập tức lên máy chủ thật.
  2. Máy chủ thật yêu cầu xác thực yếu tố thứ 2 (MFA: OTP SMS hoặc thông báo Microsoft Authenticator). Evilginx chuyển tiếp yêu cầu này về trình duyệt của nạn nhân.
  3. Nạn nhân thực hiện xác thực trên điện thoại/trình duyệt thật.
  4. Máy chủ thật xác nhận thành công và cấp phát **Session Cookie / Token xác thực** (ví dụ: `ESTSAUTH`, `ESTSAUTHPERSISTENT`, `SignInStateCookie`).
  5. Evilginx bắt trọn (intercept) các Session Cookie này lưu vào cơ sở dữ liệu trước khi chuyển tiếp nạn nhân về trang đích. Kẻ tấn công chỉ cần nạp Session Cookie này vào trình duyệt là có thể đăng nhập thẳng vào tài khoản mà không cần vượt qua MFA lần thứ hai.
* **File thực thi sẵn có:** `build/evilginx` (đã được biên dịch sẵn sàng cho Kali Linux).

---

### 🔹 2. FreeDomain (`Tools/Freedomain/`)
* **Bản chất kỹ thuật:** Kho tài liệu và cơ chế ủy quyền tên miền miễn phí (DigitalPlat FreeDomain) cấp phát các subdomain (ví dụ: `.dpdns.org`).
* **Vai trò trong dự án (Host DNS & Phục vụ Web):**
  - Để một cuộc tấn công AiTM hoạt động ngoài Internet, kẻ tấn công bắt buộc phải có tên miền công khai và chứng chỉ bảo mật HTTPS (SSL/TLS). Nếu trình duyệt hiện cảnh báo "Không bảo mật" (HTTP hoặc chứng chỉ tự ký), nạn nhân sẽ cảnh giác và không nhập mã MFA.
  - **FreeDomain** cho phép cấu hình **Nameserver Delegation (Bản ghi NS)**: Trỏ quyền quản lý DNS của subdomain về chính IP Public của máy chủ tấn công (`ns1.yourlab.dpdns.org -> <IP_PUBLIC>`).
  - Nhờ cơ chế này, Evilginx2 có thể đóng vai trò là Authoritative DNS Server để tự động vượt qua thử thách ACME (DNS-01 Challenge) và xin cấp chứng chỉ **Let's Encrypt SSL/TLS chính chủ** hoàn toàn miễn phí mà không cần mua domain từ GoDaddy/Namecheap.

---

### 🔹 3. Phishlets (`Tools/Phishlets/` & `Evilginx2/phishlets/`)
* **Bản chất kỹ thuật:** Các file cấu hình định dạng YAML định nghĩa "bản thiết kế" (blueprint) cho từng mục tiêu cụ thể.
* **Thành phần của một Phishlet:**
  - `proxy_hosts`: Định nghĩa các domain thật cần proxy và subdomain giả mạo tương ứng.
  - `credentials`: Biểu thức chính quy (Regex) để trích xuất Username và Password từ request POST.
  - `auth_tokens`: Danh sách các tên Cookie hoặc Token quan trọng cần đánh cắp (quyết định việc bypass MFA thành công).
  - `auth_urls`: Đường dẫn URL xác định người dùng đã đăng nhập thành công.
* **Mục tiêu trong kịch bản MMQ:** Phishlet sẽ được tùy biến cho tên miền `mail.mmq.khanh` (hoặc `login.microsoft-sso...`) phục vụ kịch bản phishing nhắm vào nhân viên Lan Hiếu (`Lan.hieu@mmq.khanh`).

---

## 2. Cam Kết Cấu Trúc Dự Án

Thư mục `Tools` này được quản lý chặt chẽ theo yêu cầu:
- Tuyệt đối **KHÔNG CHỨA** thư mục không liên quan (`rea`).
- Đảm bảo đầy đủ mã nguồn và nhị phân của `Evilginx2`, `Freedomain`, và các mẫu `Phishlets`.
