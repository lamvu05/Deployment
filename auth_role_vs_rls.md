# Bảng So Sánh Auth Role (JWT) và Row Level Security (RLS)

Tài liệu này so sánh chi tiết sự khác biệt giữa hai cơ chế phân quyền phổ biến: **Auth Role (thông qua JWT Token)** ở tầng ứng dụng và **Row Level Security (RLS)** ở tầng cơ sở dữ liệu.

---

| Tiêu chí | Auth Role (thông qua JWT Token) | Row Level Security (RLS) |
| :--- | :--- | :--- |
| **Vị trí hoạt động** | **Tầng Ứng dụng / API**<br>(Application Layer) | **Tầng Cơ sở dữ liệu**<br>(Database Layer) |
| **Câu hỏi cốt lõi** | "Người này là ai và có quyền gọi API này không?" | "Người này có quyền đọc/ghi dòng dữ liệu cụ thể này không?" |
| **Phạm vi bảo mật** | Rộng (Mức độ Endpoint/Bảng).<br>*Ví dụ:* Chặn user thường truy cập vào trang Admin. | Hẹp và chi tiết (Mức độ Dòng - Row).<br>*Ví dụ:* Trong cùng 1 bảng, user chỉ thấy data của mình. |
| **Cách cấp quyền** | Frontend gửi JWT lên Backend/API. Backend giải mã để lấy thông tin `role`. | Cấu hình trực tiếp bằng mã SQL trên Database. Cơ sở dữ liệu tự động kiểm tra trước khi trả kết quả. |

---

### Bảng hiển thị ở dạng Text (Xem trực tiếp không cần bật Preview)

```text
+-------------------+---------------------------------------------+----------------------------------------------+
| Tiêu chí          | Auth Role (thông qua JWT Token)             | Row Level Security (RLS)                     |
+-------------------+---------------------------------------------+----------------------------------------------+
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
