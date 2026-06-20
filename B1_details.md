# B1 Details: Giải Thích Kiến Trúc Triển Khai Database & Application Server

Tài liệu này tổng hợp toàn bộ giải thích chi tiết về lý do tại sao không nên chạy Database chung với Server ứng dụng Node.js trong môi trường Production, cách hoạt động của các dịch vụ Cloud (Render, Vercel, Supabase) và các phương pháp thiết kế hệ thống chuẩn.



1. Hiện tượng "Xóa sạch bộ nhớ tạm" (Ephemeral Storage)
Khi bạn chạy dự án trên các Cloud PaaS (ví dụ như Render bản miễn phí):

Mỗi lần bạn đẩy code mới lên hoặc khi server không có người truy cập (đi ngủ - sleep) rồi thức dậy, Render sẽ xóa toàn bộ ổ cứng cũ của server đó và tạo ra một server mới hoàn toàn từ đầu (gọi là cơ chế Stateless).
Nếu bạn cài đặt PostgreSQL chạy ngay bên trong ổ cứng của server ứng dụng đó, thì mỗi lần server khởi động lại, toàn bộ dữ liệu khách hàng, lịch đặt phòng... lưu trên ổ cứng đó sẽ bị xóa sạch 100%.
2. Sự khác biệt khi tách rời Database
Để giải quyết vấn đề trên, người ta sinh ra các dịch vụ lưu trữ Database chuyên dụng (như Supabase hay Neon):

Các dịch vụ này sử dụng ổ cứng có tính năng lưu trữ vĩnh viễn (Persistent Storage). Dữ liệu ghi vào đó sẽ được lưu lại mãi mãi, không bao giờ bị xóa kể cả khi server ứng dụng của bạn có tắt đi bật lại 1000 lần.
Khi server backend của bạn (chạy trên Render) khởi động lại, nó chỉ việc kết nối lại qua internet tới Database của Supabase để lấy dữ liệu. Dữ liệu của bạn được an toàn tuyệt đối.


## 2. Bản Chất Của Việc "Đưa Database Lên Online"

Đưa database lên online không có nghĩa là cài nó chung với code ứng dụng. Chuẩn thiết kế hệ thống (Production) yêu cầu tách biệt thành **2 server online độc lập nói chuyện với nhau qua internet**:

* **Server Ứng Dụng (Ví dụ: Render):**
  * Chỉ chứa code chạy Backend (Node.js/Express).
  * Ổ đĩa tạm thời (mất dữ liệu khi tắt máy/restart).
* **Server Database Chuyên Dụng (Ví dụ: Supabase, Neon):**
  * Chỉ chứa dữ liệu PostgreSQL.
  * Ổ đĩa vĩnh viễn (**Persistent Storage**), dữ liệu được ghi lại mãi mãi, tự động sao lưu và bảo mật, không bao giờ bị mất khi khởi động lại.


1 Đưa database lên online ở một nơi riêng chuyên dụng (như Supabase):
Đây chính là con đường đúng đắn. Supabase là một server online chuyên chứa database, ổ cứng của họ được thiết kế để giữ dữ liệu vĩnh viễn và không bao giờ bị mất khi khởi động lại.
2 Tránh chạy database chung trên server chứa code Backend (Render):
Nếu bạn tìm cách cài đặt PostgreSQL chạy chung trên con server Render (nơi bạn chạy code Node.js), dữ liệu sẽ bị mất mỗi lần Render restart.
Tóm lại: Khi chạy online thực tế, dự án của bạn sẽ gồm 2 server online độc lập nói chuyện với nhau qua internet:

Server A (Render): Chỉ giữ code chạy Backend Node.js.
Server B (Supabase): Chỉ giữ dữ liệu Database của bạn.
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



2. Quy trình làm việc chuẩn (Workflow)
Khi bạn muốn nâng cấp trang web trong tương lai (Ví dụ: Thêm tính năng gửi tin nhắn, tức là cần thêm bảng messages):

Bạn code và tạo bảng messages chạy thử dưới máy local trước.
Test thử mọi thứ (đăng ký, gửi tin nhắn local) thấy chạy mượt mà, không có lỗi.
Lúc này, bạn mới chạy lệnh đồng bộ (migration) để đẩy bảng messages lên Supabase để trang web online chính thức có tính năng mới.\



pgAdmin4 trên máy của bạn đang kết nối tới Docker PostgreSQL local (localhost:5432). Đây là cơ sở dữ liệu nội bộ, chỉ nằm trên máy tính cá nhân của bạn.
Supabase là một server database đám mây độc lập chạy trên Internet.
Hai cơ sở dữ liệu này hoàn toàn không liên kết trực tiếp với nhau. Do đó, khi bạn thêm bảng ở máy local qua pgAdmin4, Supabase sẽ không hề biết.
Muốn cập nhật bảng trên superbase 
$env:DATABASE_URL="postgresql://postgres.cgbfzoyymylzwjoxgbzv:Vuhailam123%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"; npm run db:migrate


chạy test local hoàn thành của 2 coder thì nên cử 1 người chạy code trên để tránh bị block