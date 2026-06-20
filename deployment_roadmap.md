# Lộ Trình Triển Khai Ứng Dụng Lên Môi Trường Production (Deployment Roadmap)

Tài liệu này hướng dẫn chi tiết các bước để đưa ứng dụng của bạn từ máy local lên internet (Production) để người dùng thực tế có thể truy cập mà không cần chạy local nữa.

---

## 🗺️ Bản Đồ Kiến Trúc Triển Khai (Production Architecture)

Trong môi trường thực tế, ứng dụng của bạn sẽ được tách làm 3 phần độc lập để tối ưu hóa hiệu năng, chi phí và khả năng mở rộng:

```mermaid
graph TD
    Client[Người dùng cuối / Browser] -->|HTTPS| FE[Frontend: Vercel / Netlify / Render Static]
    Client -->|HTTPS| BE[Backend: Render / Railway / VPS]
    BE -->|PostgreSQL Connection| DB[(Database: Supabase / Neon / Cloud DB)]
```

---

## 🛠️ Lựa Chọn Các Phương Án Triển Khai

Tùy vào ngân sách và kỹ năng quản trị hệ thống, bạn có thể lựa chọn 1 trong 2 con đường sau:

| Tiêu chí | Phương án 1: Platform-as-a-Service (PaaS) - **KHUYÊN DÙNG** | Phương án 2: Tự Vận Hành Trên VPS Riêng |
| :--- | :--- | :--- |
| **Dịch vụ gợi ý** | **Frontend**: Vercel/Netlify (Miễn phí)<br>**Backend**: Render/Railway (Miễn phí/Rẻ)<br>**Database**: Supabase/Neon (Có gói miễn phí) | VPS Ubuntu của **DigitalOcean / Linode / Vultr** hoặc AWS EC2 |
| **Độ phức tạp** | **Rất dễ** (Không cần cấu hình server, SSL tự động, tích hợp Git chỉ bằng vài click) | **Trung bình - Khó** (Phải tự cài Docker, cấu hình Nginx reverse proxy, tự cấp chứng chỉ SSL) |
| **Chi phí** | 0đ cho giai đoạn thử nghiệm (Free tier) | Khoảng 5$ - 10$ / tháng trở lên |

---

## 📋 Chi Tiết Các Bước Thực Hiện (Phương án PaaS - Khuyên Dùng)

### 1️⃣ Bước 1: Triển khai Database Cloud (PostgreSQL)
Bạn không nên chạy database trên cùng server ứng dụng để tránh mất dữ liệu khi server khởi động lại.
* **Nền tảng gợi ý:** [Supabase](https://supabase.com/) hoặc [Neon Console](https://neon.tech/).
* **Cách làm:**
  1. Tạo một tài khoản trên Supabase và khởi tạo một project PostgreSQL mới (hoàn toàn miễn phí).
  2. Vào mục **Settings > Database** để lấy chuỗi kết nối **URI** (định dạng `postgresql://user:password@host:port/dbname`).
  3. Chạy các file di cư dữ liệu (migrations) từ máy local lên database cloud để tạo cấu trúc bảng:
     ```bash
     # Tại thư mục backend của dự án:
     DATABASE_URL="chuỗi_kết_nối_supabase_của_bạn" npm run db:migrate
     ```

### 2️⃣ Bước 2: Triển khai Backend API
* **Nền tảng gợi ý:** [Render.com](https://render.com/) hoặc [Railway.app](https://railway.app/).
* **Cách làm (trên Render):**
  1. Đăng nhập Render, chọn **New > Web Service**.
  2. Liên kết tài khoản GitHub và chọn repository `Deployment` của bạn.
  3. Cấu hình cài đặt Web Service:
     * **Root Directory:** `backend`
     * **Build Command:** `npm install`
     * **Start Command:** `npm start`
  4. Thêm các biến môi trường (**Environment Variables**) trong mục Settings của Render:
     * `NODE_ENV`: `production`
     * `PORT`: `10000` (hoặc để trống vì Render tự động gán cổng)
     * `DATABASE_URL`: *Chuỗi kết nối lấy từ Bước 1*
     * `JWT_SECRET`: *Một chuỗi ký tự ngẫu nhiên, dài và bảo mật*
     * `CLIENT_URL`: *URL của Frontend (sẽ có sau khi làm xong Bước 3)*
     * `GOOGLE_CLIENT_ID`: *Google Client ID dùng cho đăng nhập*
  5. Nhấn **Deploy Web Service** và chờ hệ thống build xong. Bạn sẽ nhận được một URL backend dạng: `https://deployment-backend.onrender.com`.

### 3️⃣ Bước 3: Cấu hình và Triển khai Frontend
* **Nền tảng gợi ý:** [Vercel](https://vercel.com/) (Tối ưu nhất cho các ứng dụng React).
* **Cách làm:**
  1. Đăng nhập Vercel, chọn **Add New > Project**, import repository `Deployment`.
  2. Cấu hình cài đặt Project:
     * **Root Directory:** `frontend`
     * **Framework Preset:** `Vite`
     * **Build Command:** `npm run build`
     * **Output Directory:** `dist`
  3. Thêm các biến môi trường (**Environment Variables**) của Frontend:
     * `VITE_API_URL`: *URL của Backend vừa tạo ở Bước 2* (Ví dụ: `https://deployment-backend.onrender.com/api`)
     * `VITE_GOOGLE_CLIENT_ID`: *Google Client ID dùng cho đăng nhập*
  4. Nhấn **Deploy**. Bạn sẽ nhận được một URL frontend dạng: `https://deployment-frontend.vercel.app`.

### 4️⃣ Bước 4: Khớp nối và Cập nhật cấu hình chéo
Sau khi có đầy đủ 2 URL thật trên Internet, bạn cần cập nhật chéo chúng để các chức năng (nhuy đăng nhập Google, CORS) hoạt động đúng:
1. **Tại trang cài đặt Backend (Render):** Cập nhật biến môi trường `CLIENT_URL` bằng URL frontend thực tế (`https://deployment-frontend.vercel.app`).
2. **Cấu hình Google Console:**
   * Truy cập [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials).
   * Tại mục **Authorized JavaScript origins** của Client ID, hãy thêm:
     * `https://deployment-frontend.vercel.app` (URL của frontend)
   * Tại mục **Authorized redirect URIs**, thêm URL tương tự nếu ứng dụng có yêu cầu chuyển hướng.
   * Nhấn **Save** và đợi 2-3 phút để cập nhật đồng bộ.

---

## ⚡ Tích Hợp Vào CI/CD Tự Động (GitHub Actions)

Vì dự án của bạn đã có file cấu hình GitHub Actions (`.github/workflows/ci-cd.yml`), mỗi lần bạn commit code mới, GitHub sẽ tự động kiểm tra code.
Để việc triển khai tự động kích hoạt sau khi CI chạy thành công (CD), bạn có thể lấy **Deploy Hook** của Render hoặc Vercel để nhúng vào bước cuối của file CI/CD:

1. Trên Render, vào **Web Service > Settings > Deploy Hook** và copy URL deploy tự động.
2. Thêm URL này vào mục **Settings > Secrets and variables > Actions** của Repository GitHub của bạn với tên: `RENDER_DEPLOY_HOOK_URL`.
3. Khi bạn push code lên nhánh `main`, code mới sẽ tự động được test, build và cập nhật trực tiếp lên server mà bạn không cần phải làm thủ công.

---

> [!TIP]
> **Khuyến nghị cho tên miền riêng (Custom Domain):**
> Cả Vercel và Render đều cho phép bạn trỏ tên miền riêng mua từ các nhà đăng ký (như Namecheap, GoDaddy, Mắt Bão) vào hoàn toàn miễn phí. Chứng chỉ bảo mật SSL (HTTPS) sẽ được cấp tự động và gia hạn miễn phí trọn đời.
