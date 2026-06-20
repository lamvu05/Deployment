# B1 Details: Giải Thích Kiến Trúc Triển Khai Database & Application Server

Tài liệu này tổng hợp toàn bộ giải thích chi tiết về lý do tại sao không nên chạy Database chung với Server ứng dụng Node.js trong môi trường Production, cách hoạt động của các dịch vụ Cloud (Render, Vercel, Supabase) và các phương pháp thiết kế hệ thống chuẩn.

---

## 1. Hiện Tượng "Xóa Sạch Bộ Nhớ Tạm" (Stateless & Ephemeral Storage)

Khi chạy ứng dụng trên các nền tảng đám mây hiện đại (như Render bản miễn phí):
* **Tính chất Stateless (Không giữ trạng thái):** Mỗi khi server restart hoặc build lại, nhà cung cấp dịch vụ sẽ xóa toàn bộ ổ cứng cũ của máy ảo đó và tạo mới hoàn toàn từ đầu.
* **Hậu quả:** Nếu cài đặt cơ sở dữ liệu (PostgreSQL) trực tiếp trên cùng server chứa code Node.js, toàn bộ dữ liệu lịch đặt phòng, tài khoản khách hàng... được lưu trên ổ cứng tạm thời này sẽ **bị xóa sạch 100% khi server restart**.

---

## 2. Bản Chất Của Việc "Đưa Database Lên Online"

Đưa database lên online không có nghĩa là cài nó chung với code ứng dụng. Chuẩn thiết kế hệ thống (Production) yêu cầu tách biệt thành **2 server online độc lập nói chuyện với nhau qua internet**:

* **Server Ứng Dụng (Ví dụ: Render):**
  * Chỉ chứa code chạy Backend (Node.js/Express).
  * Ổ đĩa tạm thời (mất dữ liệu khi tắt máy/restart).
* **Server Database Chuyên Dụng (Ví dụ: Supabase, Neon):**
  * Chỉ chứa dữ liệu PostgreSQL.
  * Ổ đĩa vĩnh viễn (**Persistent Storage**), dữ liệu được ghi lại mãi mãi, tự động sao lưu và bảo mật, không bao giờ bị mất khi khởi động lại.

---

## 3. Tại Sao Server Ứng Dụng (Render) Lại Restart?

Render và các nền tảng tương tự tự động khởi động lại server vì 3 nguyên nhân chính:

1. **Cập nhật mã nguồn (Deployment):** Mỗi khi bạn push code mới lên GitHub, Render sẽ build lại dự án bằng cách tạo một container (máy ảo) mới hoàn toàn chứa code mới và hủy container cũ.
2. **Chế độ ngủ tiết kiệm tài nguyên (Idling - Bản Free):** Khi không có người truy cập trong **15 phút**, Render sẽ tạm thời tắt server. Khi có request mới gửi tới, nó sẽ tự khởi động lại (quá trình này mất khoảng 30s - 1 phút, gọi là *Cold Start*).
3. **Bảo trì hệ thống (Maintenance):** Nhà cung cấp đám mây thường xuyên cập nhật phần cứng hoặc vá lỗi bảo mật hệ điều hành vật lý, khiến ứng dụng được chuyển sang các node phần cứng khác.

---

## 4. Các Nền Tảng Khác Có Hoạt Động Giống Render Không?

Hầu hết các nền tảng Cloud hiện đại ngày nay đều được phân chia rõ rệt thành 2 nhóm:

### Nhóm 1: Dịch vụ Stateless (Mất dữ liệu ổ cứng khi restart)
* **Các dịch vụ tương tự:** **Heroku, Railway, Fly.io, Google Cloud Run, AWS ECS (Fargate).**
* **Nền tảng Serverless:** **Vercel, Netlify, AWS Lambda.**
* **Đặc điểm:** Sử dụng công nghệ **Container (Docker)** để dễ dàng nhân bản, tắt mở nhanh chóng. Bất kỳ file nào ghi trực tiếp lên ổ đĩa của container đều sẽ biến mất khi restart.

### Nhóm 2: Dịch vụ Stateful (Giữ dữ liệu ổ cứng khi restart)
* **Dịch vụ:** Các máy ảo VPS truyền thống như **AWS EC2, DigitalOcean Droplets, Vultr, Linode.**
* **Đặc điểm:** Hoạt động như máy tính cá nhân ở nhà của bạn, có gắn một ổ đĩa ảo vĩnh viễn. Khi khởi động lại máy ảo, dữ liệu vẫn được giữ nguyên vẹn.

---

## 5. Lời Khuyên Thiết Kế Hệ Thống Chuẩn (Best Practice)

Kể cả khi bạn tự mua một VPS riêng (nhóm Stateful không mất dữ liệu khi restart), bạn vẫn nên **tách biệt Database ra một server riêng biệt** vì:

* **Tránh quá tải chéo:** Database tiêu tốn cực kỳ nhiều tài nguyên đọc/ghi ổ cứng (I/O) và bộ nhớ RAM. Nếu code backend của bạn bị tràn bộ nhớ (Memory Leak) hoặc bị quá tải lượt truy cập, nó sẽ làm sập luôn database nếu chạy chung.
* **Bảo mật và Sao lưu:** Tách riêng giúp bạn dễ dàng thiết lập tường lửa chỉ cho phép Backend kết nối tới DB, đồng thời tự động sao lưu định kỳ (Backup) dễ dàng hơn mà không ảnh hưởng tới hoạt động của web.
