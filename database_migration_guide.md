# 🗃️ HƯỚNG DẪN ĐỒNG BỘ DATABASE LOCAL (pgAdmin4) LÊN SUPABASE

Tài liệu này hướng dẫn chi tiết cách đưa cơ sở dữ liệu PostgreSQL từ môi trường chạy thử dưới máy local (pgAdmin4) lên hệ thống Cloud của Supabase để phục vụ chạy Production thực tế.

---

## 🎯 Khi Nào Nên Dùng Cách Nào?

| Phương pháp | Khi nào nên dùng? | Ưu điểm | Nhược điểm |
| :--- | :--- | :--- | :--- |
| **Cách 1: Chạy Migrations qua Code** *(Khuyên dùng)* | Khi bạn chỉ cần đồng bộ **cấu trúc bảng** (các cột, kiểu dữ liệu, các bảng trống) và muốn bắt đầu nhập dữ liệu mới tinh trên môi trường online. | Rất nhanh, sạch sẽ, chuẩn quy trình phát triển dự án chuyên nghiệp, tránh rác dữ liệu test local. | Không mang được các dữ liệu cũ (User, Booking bạn đã tự nhập test dưới local) lên. |
| **Cách 2: Export/Import SQL từ pgAdmin4** | Khi bạn đã tạo sẵn **nhiều dữ liệu kiểm thử quan trọng** ở local (ví dụ: các gói dịch vụ, tài khoản test) và không muốn mất công nhập lại trên web online. | Mang được 100% cả cấu trúc bảng lẫn toàn bộ dữ liệu đang có dưới máy lên online. | File SQL xuất ra đôi khi chứa các thiết lập đặc thù của local, cần copy thủ công. |

---

## 🚀 CÁCH 1: Sử dụng Lệnh Migrations của Code (Đồng bộ cấu trúc)

Cách này tận dụng các file mô tả bảng đã được viết sẵn trong thư mục `backend/migrations`.

### Bước 1: Lấy chuỗi kết nối URI của Supabase
1. Đăng nhập vào trang quản trị [Supabase Dashboard](https://supabase.com/).
2. Chọn project của bạn, click vào biểu tượng **Settings (hình bánh răng)** ở menu bên trái.
3. Vào mục **Database**.
4. Kéo xuống phần **Connection string**, chọn tab **URI**.
5. Copy chuỗi kết nối có dạng:
   `postgresql://postgres.[tên-project]:[mật-khẩu-của-bạn]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   *(Nhớ thay `[mật-khẩu-của-bạn]` bằng mật khẩu Supabase của bạn)*.

### Bước 2: Chạy lệnh đồng bộ
1. Tắt tạm thời server đang chạy hoặc mở một tab terminal mới.
2. Điều hướng vào thư mục `backend` của dự án.
3. Thiết lập biến môi trường tạm thời và chạy migrate:

*   **Nếu dùng Windows PowerShell (mặc định của VS Code):**
    ```powershell
    $env:DATABASE_URL="dán_chuỗi_kết_nối_URI_vừa_copy_ở_đây"
    npm run db:migrate
    ```
*   **Nếu dùng Command Prompt (cmd):**
    ```cmd
    set DATABASE_URL=dán_chuỗi_kết_nối_URI_vừa_copy_ở_đây
    npm run db:migrate
    ```

---

## 📦 CÁCH 2: Export/Import SQL từ pgAdmin4 (Đồng bộ cả dữ liệu)

Cách này trích xuất toàn bộ cấu trúc và dữ liệu từ PostgreSQL local thành một file mã lệnh `.sql` rồi nạp vào Supabase.

### Bước A: Xuất dữ liệu từ pgAdmin4 (Local)
1. Mở **pgAdmin4** trên máy của bạn.
2. Tìm tới Database local của bạn (Ví dụ: `appdb` hoặc `postgres`).
3. Click chuột phải vào tên Database, chọn **Backup...**
4. Ở tab **General**:
   * **Filename:** Click vào hình thư mục để chọn nơi lưu và đặt tên file (Ví dụ: `C:\Users\pc\Desktop/db_backup.sql`).
   * **Format:** Chọn **Plain**.
5. Ở tab **Dump options**:
   * Tại mục **Type of objects**, chọn **Schema and data** (để lấy cả bảng và dữ liệu) hoặc **Only data** (nếu bạn đã làm cách 1 và chỉ muốn lấy dữ liệu).
6. Nhấp nút **Backup** và chờ thông báo thành công.

### Bước B: Nạp dữ liệu vào Supabase
1. Mở file `db_backup.sql` vừa tạo bằng Notepad hoặc VS Code.
2. Nhấn `Ctrl + A` chọn tất cả và `Ctrl + C` để copy toàn bộ nội dung file.
3. Truy cập trang quản trị [Supabase](https://supabase.com/).
4. Click chọn mục **SQL Editor** (Biểu tượng `>_`) ở menu bên trái.
5. Click **New Query** (hoặc nút **Create a new query**).
6. Dán đoạn mã SQL đã copy vào ô soạn thảo.
7. Click nút **Run** ở góc dưới bên phải và đợi thông báo thành công.

---

## 🔍 Kiểm tra kết quả
Sau khi thực hiện một trong hai cách trên, bạn có thể kiểm tra:
1. Trên Supabase, truy cập mục **Table Editor** (Biểu tượng bảng lưới) ở menu bên trái.
2. Kiểm tra xem các bảng `users`, `services`, `bookings`, `reviews` đã xuất hiện và hiển thị đầy đủ thông tin hay chưa.
