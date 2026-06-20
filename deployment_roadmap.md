# 📋 LỘ TRÌNH TRIỂN KHAI ỨNG DỤNG LÊN PRODUCTION (PaaS - KHUYÊN DÙNG)

> [!IMPORTANT]
> **Quy tắc cốt lõi:** Bạn không nên chạy database trên cùng server với code ứng dụng để tránh mất dữ liệu khi server khởi động lại. Hãy làm theo 4 bước dưới đây để cấu hình độc lập.

---

## 1️⃣ Bước 1: Triển khai Database Cloud (PostgreSQL)

*   **Nền tảng gợi ý:** [Supabase](https://supabase.com/) hoặc [Neon Console](https://neon.tech/) (hoàn toàn miễn phí).
*   **Các bước thực hiện:**
    1.  Tạo tài khoản và khởi tạo một project PostgreSQL mới.
    2.  Vào mục **Settings > Database** để lấy chuỗi kết nối **URI** (định dạng `postgresql://user:password@host:port/dbname`).
    3.  Chạy migration để đồng bộ cấu trúc bảng từ máy local lên Cloud Database:
        ```bash
        # Mở Terminal tại thư mục /backend của dự án:
        DATABASE_URL="chuỗi_kết_nối_URI_của_bạn" npm run db:migrate
        ```

---

## 2️⃣ Bước 2: Triển khai Backend API

*   **Nền tảng gợi ý:** [Render.com](https://render.com/) hoặc [Railway.app](https://railway.app/).
*   **Các bước thực hiện (trên Render):**
    1.  Đăng nhập Render, chọn **New > Web Service**.
    2.  Liên kết tài khoản GitHub và chọn repository `Deployment` của bạn.
    3.  Cấu hình cài đặt Web Service:
        *   **Root Directory:** `backend`
        *   **Build Command:** `npm install`
        *   **Start Command:** `npm start`
    4.  Cài đặt các **Biến môi trường (Environment Variables)** trong mục Settings:
        *   `NODE_ENV`: `production`
        *   `PORT`: `10000` *(hoặc để trống)*
        *   `DATABASE_URL`: *(Chuỗi kết nối lấy từ Bước 1)*
        *   `JWT_SECRET`: *(Một chuỗi ký tự bí mật tự chế bất kỳ, ví dụ: `mySuperSecretKey123!`)*
        *   `CLIENT_URL`: *(URL của Frontend - sẽ có sau khi làm xong Bước 3)*
        *   `GOOGLE_CLIENT_ID`: *(Google Client ID lấy từ file .env của bạn)*
    5.  Nhấn **Deploy Web Service** và đợi hệ thống hoàn tất. Bạn sẽ nhận được URL Backend dạng:  
        `https://deployment-backend.onrender.com`

---

## 3️⃣ Bước 3: Triển khai Frontend

*   **Nền tảng gợi ý:** [Vercel](https://vercel.com/) (Tối ưu nhất cho các ứng dụng React).
*   **Các bước thực hiện:**
    1.  Đăng nhập Vercel, chọn **Add New > Project**, import repository `Deployment`.
    2.  Cấu hình cài đặt Project:
        *   **Root Directory:** `frontend`
        *   **Framework Preset:** `Vite`
        *   **Build Command:** `npm run build`
        *   **Output Directory:** `dist`
    3.  Cài đặt các **Biến môi trường (Environment Variables)** cho Frontend:
        *   `VITE_API_URL`: `https://deployment-backend.onrender.com/api` *(URL Backend vừa tạo ở Bước 2)*
        *   `VITE_GOOGLE_CLIENT_ID`: *(Google Client ID dùng cho đăng nhập)*
    4.  Nhấn **Deploy**. Bạn sẽ nhận được URL Frontend dạng:  
        `https://deployment-frontend.vercel.app`

---

## 4️⃣ Bước 4: Khớp nối và Cập nhật cấu hình chéo

> [!NOTE]
> Sau khi có đầy đủ 2 đường dẫn URL thật trên Internet, bạn cần liên kết chéo chúng để tính năng đăng nhập Google và CORS hoạt động chính xác.

1.  **Tại trang cấu hình Backend (Render):**  
    Cập nhật lại biến môi trường `CLIENT_URL` thành:  
    `https://deployment-frontend.vercel.app` *(URL của Frontend vừa lấy từ Bước 3)*.
2.  **Cấu hình Google Console:**
    *   Truy cập [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials).
    *   Mở Client ID đang dùng, tại mục **Authorized JavaScript origins**, thêm URL frontend:  
        `https://deployment-frontend.vercel.app`
    *   Tại mục **Authorized redirect URIs**, thêm URL tương tự nếu ứng dụng yêu cầu chuyển hướng.
    *   Nhấn **Save** và chờ 2-3 phút để Google cập nhật.

---

## ⚡ Tích Hợp Vào CI/CD Tự Động (GitHub Actions)

Mỗi lần bạn commit code mới, GitHub sẽ tự động chạy luồng check. Bạn có thể thiết lập để Render tự động deploy khi code sạch vượt qua vòng kiểm tra:

1.  Trên Render, vào **Web Service > Settings > Deploy Hook** và sao chép đường dẫn URL deploy tự động.
2.  Vào repository GitHub của bạn, chọn **Settings > Secrets and variables > Actions > New repository secret**.
3.  Đặt tên secret là `RENDER_DEPLOY_HOOK_URL` và dán URL vừa copy vào.
4.  Khi bạn push code lên nhánh `main`, hệ thống sẽ tự động test, build và cập nhật thẳng lên môi trường online.