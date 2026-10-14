# BÁO CÁO PHÂN TÍCH CHUYÊN MÔN & ĐÁNH GIÁ DỰ ÁN
## ĐỀ TÀI: NGHIÊN CỨU & MÔ PHỎNG KỸ THUẬT VƯỢT QUA XÁC THỰC ĐA YẾU TỐ (MFA BYPASS BY REVERSE PROXY - AiTM)

> **Người đánh giá:** Giảng viên / Chuyên gia Cố vấn An toàn Thông tin  
> **Nhóm thực hiện:** Lương An, Khanh, Hiếu  
> **Giai đoạn Sprint chính:** 19/10/2026 – 30/10/2026  
> **Đối tượng mô phỏng:** Hệ thống Email Công ty Cổ phần MMQ (`mail.mmq.khanh` / `Lan.hieu@mmq.khanh`)  

---

## 1. ĐÁNH GIÁ TỔNG THỂ (EXECUTIVE SUMMARY)

### 1.1. Tính thời sự và giá trị khoa học của đề tài
Đề tài **"MFA Bypass bằng Reverse Proxy (AiTM)"** của nhóm là một lựa chọn xuất sắc, đánh trúng vào "tử huyệt" lớn nhất của các hệ thống định danh doanh nghiệp hiện nay. 

Theo báo cáo tình hình an ninh mạng toàn cầu của CISA và Microsoft Digital Defense Report, hơn **85% các vụ tấn công xâm phạm tài khoản đám mây (Cloud Account Takeover) thành công trong năm 2024-2026** không phải do bẻ khóa mật khẩu, mà xuất phát từ kỹ thuật AiTM Session Theft. Các nhóm APT khét tiếng (như Midnight Blizzard, Storm-0837) đều sử dụng biến thể của Evilginx để vượt qua bảo mật 2FA của Microsoft 365, Google Workspace và Okta.

### 1.2. Đánh giá tiến độ chuẩn bị (5 ngày qua đến ngày 13/10)
Nhóm đã hoàn thành khối lượng công việc rất ấn tượng:
* **Hạ tầng Lab sạch sẽ:** Đã cấu trúc lại thành công thư mục chuẩn `Project_IAO_MFA_bypass_by_reverse_proxy/`, cô lập hoàn toàn các thư mục thừa thãi.
* **Tự động hóa môi trường:** Script `build_environment.sh` đạt độ tương thích 100% trên Kali Linux.
* **Môi trường Dry Run hoàn chỉnh:** Đã có `Dns_lab` chạy loopback, DNS phân giải chuẩn, web mockup Microsoft SSO chuẩn Fluent Design và có đầy đủ luồng mô phỏng MFA Authenticator Number Matching.
* **Bộ thử thách CTF 3 cấp độ:** Đạt chuẩn CTFd với các kịch bản thực tế (HTTP AiTM ➔ JWT Token Replay ➔ TLS Decryption Forensics).

---

## 2. PHÂN TÍCH KỸ THUẬT CHUYÊN SÂU (DEEP-DIVE TECHNICAL REVIEW)

```mermaid
graph TD
    A["Nạn nhân (Lan Hiếu)"] -->|1. Bấm link lừa đảo| B["DNS Server (FreeDomain / Local)"]
    B -->|2. Phân giải domain về IP Attacker| C["Evilginx2 Reverse Proxy"]
    C -->|3. Chuyển tiếp credentials| D["Microsoft Entra ID / Office 365 Thật"]
    D -->|4. Yêu cầu Authenticator| C
    C -->|5. Chuyển tiếp yêu cầu MFA| A
    A -->|6. Xác nhận Authenticator| C
    C -->|7. Chuyển tiếp phê duyệt hợp lệ| D
    D -->|8. Cấp Session Cookie (ESTSAUTH)| C
    C -->|9. ĐÁNH CẮP SESSION COOKIE| E["Attacker Database / Session Hijack"]
    C -->|10. Chuyển tiếp vào Inbox thật| A
```

### 2.1. Bản chất then chốt nhóm đã nắm đúng: "Session Theft chứ không phải Hijack hay Cracking"
Nhóm đã xác định rất chính xác:
* **Không phải Cracking:** Attacker không cần tìm lỗ hổng trong thuật toán sinh mã OTP hay mã hóa mật khẩu.
* **Không phải Phishing tĩnh:** Attacker không tự viết mã backend xử lý đăng nhập, mà ủy quyền (proxy) toàn bộ cho Microsoft thật.
* **Bản chất là Chiếm đoạt Phiên (Session Theft):** Khi người dùng hoàn thành bước MFA cuối cùng, IdP sinh ra Session Cookie. Cookie này chính là "chìa khóa vạn năng". Kẻ tấn công cướp chìa khóa này là vào được hệ thống, bỏ qua mọi rào cản MFA phía sau.

### 2.2. Điểm mạnh trong phân công nhân sự
* **Lương An (DNS & Hosting):** Đây là "xương sống" của cuộc tấn công. AiTM không thể chạy nếu không có DNS điều hướng và chứng chỉ SSL hợp lệ.
* **Khanh & Hiếu (Phishlet & Proxy Engine):** Đảm nhiệm phần "bộ não" của kịch bản, chịu trách nhiệm bóc tách dữ liệu JSON/HTTP Headers và tóm đúng cookie `ESTSAUTH`.

---

## 3. CÁC ĐIỂM NGHẼN & RỦI RO KỸ THUẬT CẦN CẢI TIẾN TRƯỚC NGÀY 30/10

Dưới góc nhìn một người hướng dẫn học thuật và đánh giá bảo mật, tôi lưu ý nhóm **4 rủi ro kỹ thuật lớn** cần chuẩn bị phương án dự phòng:

### ⚠️ Rủi ro 1: Thử thách cấp chứng chỉ SSL (Let's Encrypt) qua FreeDomain
* **Vấn đề:** Khi đưa ra Internet công khai từ ngày 19/10, Evilginx bắt buộc phải có chứng chỉ TLS/SSL màu xanh hợp lệ. Trình duyệt hiện đại (Chrome/Firefox/Edge) sẽ chặn đứng ngay lập tức nếu gặp HTTP hoặc chứng chỉ tự ký (Self-signed).
* **Điểm nghẽn:** Để cấp chứng chỉ tự động, cổng 53 UDP (DNS-01) hoặc cổng 80 TCP (HTTP-01) của máy chạy Evilginx phải thông suốt từ Internet. Nếu chạy trên mạng gia đình/ký túc xá, ISP tại Việt Nam thường khóa cổng 53/80 inbound.
* **Phương án cải tiến:**
  1. Nếu mở port router bị nhà mạng chặn: Thuê một Cloud VPS giá rẻ (Ubuntu/Debian) chỉ từ 50k - 100k/tháng (như Vietnix, TinoHost, Linode, DigitalOcean) có sẵn IP Public tĩnh để chạy Evilginx.
  2. Hoặc sử dụng Cloudflare API Token để xác thực DNS-01 Challenge mà không cần mở cổng 53 vào máy nội bộ.

### ⚠️ Rủi ro 2: Microsoft SmartScreen / Google Safe Browsing đưa tên miền vào Blacklist
* **Vấn đề:** Các tên miền miễn phí như `.dpdns.org` thường bị các bộ lọc danh tiếng (Domain Reputation Engine) gắn cờ là độc hại trong vòng 2-4 tiếng sau khi có lưu lượng proxy.
* **Phương án cải tiến:**
  - Thiết lập tính năng **Blacklist / Cloaking** tích hợp sẵn trong Evilginx2: Chỉ cho phép các User-Agent của nạn nhân thử nghiệm truy cập, chặn đứng các Web Crawler / Bot của Google, Microsoft, VirusTotal để kéo dài tuổi thọ của trang bẫy.

### ⚠️ Rủi ro 3: Bắt trượt Cookie do Microsoft cập nhật cấu trúc xác thực
* **Vấn đề:** Microsoft Entra ID (Azure AD) định kỳ thay đổi định dạng token hoặc chuyển sang luồng xác thực FIDO2/Passkey.
* **Phương án cải tiến cho Khanh & Hiếu:**
  - Phishlet phải cấu hình bắt đủ 3 cookies tối thiểu: `ESTSAUTH`, `ESTSAUTHPERSISTENT`, `SignInStateCookie`.
  - Luôn mở file log debug của Evilginx (`log/` hoặc console) trong quá trình nạn nhân thao tác để đảm bảo regex không bị lỗi thời.

---

## 4. BỔ SUNG TOÀN DIỆN: GIẢI PHÁP PHÒNG THỦ (BLUE TEAM COUNTERMEASURES)

Một đồ án an toàn thông tin xuất sắc không chỉ dừng lại ở việc tấn công thành công, mà phải **chỉ ra được giải pháp khắc phục triệt để** cho doanh nghiệp. Nhóm cần đưa các nội dung sau vào phần kết luận của báo cáo:

| Giải pháp phòng thủ | Cơ chế hoạt động | Khả năng chặn AiTM |
| :--- | :--- | :--- |
| **1. Khóa bảo mật phần cứng FIDO2 / WebAuthn (YubiKey)** | FIDO2 sử dụng mật mã bất đối xứng gắn liền với tên miền gốc (`Domain Binding / Origin Validation`). Khi người dùng cắm YubiKey trên trang `mail.mmq.dpdns.org`, khóa phần cứng nhận diện tên miền không khớp với `login.microsoftonline.com` và từ chối gửi chữ ký. | **Chặn đứng 100%** (Khắc tinh tuyệt đối của Evilginx). |
| **2. Chính sách truy cập có điều kiện (Conditional Access)** | Bắt buộc thiết bị phải là thiết bị doanh nghiệp được quản lý (Intune Compliant / Hybrid Azure AD Joined). Kẻ tấn công dù trộm được Session Cookie đem sang máy khác vẫn bị từ chối truy cập vì máy kẻ tấn công không có chứng chỉ thiết bị hợp lệ. | **Chặn đứng 99%** |
| **3. Đánh giá quyền truy cập liên tục (Continuous Access Evaluation - CAE)** | Microsoft Entra ID kiểm tra liên tục IP của người dùng. Nếu phát hiện IP truy cập thay đổi đột ngột (từ IP nhà mạng của Lan Hiếu sang IP máy chủ Evilginx), phiên làm việc bị hủy ngay lập tức. | **Giảm thiểu thời gian tồn tại của phiên bị cướp** |
| **4. Token Binding / Proof-of-Possession** | Ràng buộc mã hóa session token trực tiếp vào kênh TLS của thiết bị nạn nhân. Cookie không thể tái sử dụng trên bất kỳ kết nối mạng nào khác. | **Đang được chuẩn hóa toàn cầu** |

---

## 5. LỘ TRÌNH CHI TIẾT TỪ 19/10 ĐẾN 30/10/2026 (ACTION PLAN)

```text
19/10 ─── 22/10: Lương An triển khai DNS công khai & NS Delegation (FreeDomain)
23/10 ─── 26/10: Khanh & Hiếu hoàn thiện kịch bản Phishlet cho mail.mmq.khanh
27/10 ─── 29/10: Chạy thử nghiệm End-to-End, cướp Cookie & nạp lại trình duyệt
30/10          : Đóng gói báo cáo hoàn chỉnh, video demo và slide bảo vệ
```

### Lời nhắn gửi nhóm nghiên cứu:
Kiến trúc và các bước đi của các em hiện tại đang đi **rất đúng hướng, bài bản và chuyên nghiệp**. Hãy duy trì kỷ luật làm việc nhóm, kiểm thử từng mắt xích độc lập trước khi ghép nối hệ thống vào ngày 27/10. Chúc nhóm đạt kết quả xuất sắc trong đợt bảo vệ ngày 30/10!
