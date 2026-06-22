1. SUPABASE_URL (Địa chỉ dự án)
Ý nghĩa: Đây là "địa chỉ nhà" duy nhất của dự án của bạn trên máy chủ Supabase.
Vai trò: Cả Frontend (React) và Backend (Node.js) đều cần đường dẫn này để biết phải gửi các yêu cầu (yêu cầu đăng nhập, tải ảnh, lấy dữ liệu) tới đâu trên Internet.

2. SUPABASE_ANON_KEY (Khóa công khai - Anonymous Key)
Ý nghĩa: Đây là chiếc chìa khóa cổng phụ, được thiết kế để sử dụng công khai ở phía Frontend (ngay trên trình duyệt của người dùng).
Vai trò: Key này cho phép người dùng chưa đăng nhập hoặc khách truy cập có thể tương tác với cơ sở dữ liệu. Tuy nhiên, họ chỉ làm được những gì mà bạn cho phép thông qua các chính sách bảo mật (gọi là Row Level Security - RLS) trên Supabase.
Bảo mật: Key này an toàn khi để lộ ở phía Client/Frontend.


3. SUPABASE_SERVICE_ROLE_KEY (Khóa quản trị - Service Role Key)
Ý nghĩa: Đây là chiếc chìa khóa vạn năng (Master Key) của hệ thống.
Vai trò: Key này có toàn quyền tối cao, bỏ qua hoàn toàn mọi chính sách bảo mật (RLS) để can thiệp trực tiếp vào database. Nó thường được sử dụng ở phía Backend để thực hiện các tác vụ quản trị hệ thống (như tạo tài khoản hàng loạt, dọn dẹp dữ liệu rác, xử lý các logic phức tạp trên server).
Bảo mật: Key này tuyệt đối bí mật, chỉ lưu ở file .env của Backend và không bao giờ được gửi xuống Frontend.

### Bảng hiển thị ở dạng Text (Xem trực tiếp không cần bật Preview)


+-------------------+-------------------------------------------------------------------------+-----------------------------------------------------------------|---------------------------
| Tiêu chí          | Auth Role (thông qua JWT Token)             | (RLS)                     
+-------------------+-------------------------------------------------------------------------+-----------------------------------------------------------------|---------------------------
| Vị trí hoạt động  | Tầng Ứng dụng / API (Application Layer)     | Tầng Cơ sở dữ liệu (Database Layer)          |
+-------------------+---------------------------------------------+----------------------------------------------+
| Câu hỏi cốt lõi   | "Người này là ai và có quyền gọi API này    | "Người này có quyền đọc/ghi dòng dữ liệu    |
|                   | không?"                                     | cụ thể này không?"                           |
+-------------------+---------------------------------------------+----------------------------------------------+
| Phạm vi bảo mật   | Rộng (Mức độ Endpoint/Bảng).                | Hẹp và chi tiết (Mức độ Dòng - Row).         |
|                   | Ví dụ: Chặn user thường truy cập vào Admin  | Ví dụ: Trong cùng 1 bảng, chỉ thấy data mình |
+-------------------+---------------------------------------------+----------------------------------------------+
| Cách cấp quyền    | Frontend gửi JWT lên Backend. Backend giải  | Cấu hình trực tiếp bằng mã SQL trên Database |
|                   | mã để lấy thông tin role.                   | để database tự kiểm tra khi truy vấn.        |
+-------------------+---------------------------------------------+----------------------------------------------+
```
