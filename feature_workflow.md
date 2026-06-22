# 🚀 Workflow: Tạo Tính Năng Mới & Đẩy Lên Online

> Đây là quy trình chuẩn của team dựa trên những gì đã thực hiện thực tế hôm nay với tính năng **Notifications** và **Favourites**.

---

## Tổng Quan Quy Trình

```
[Local Dev] → [Git Branch] → [Test Local] → [Push] → [PR on GitHub] → [Merge → CI/CD tự động] → [Online]
```

---

## 📋 BƯỚC 1: Tạo Nhánh Mới (Branch)

> **Nguyên tắc:** KHÔNG BAO GIỜ code trực tiếp trên nhánh `main`. Mỗi tính năng mới = 1 nhánh riêng.

```bash
# Luôn đảm bảo main của bạn là mới nhất trước
git checkout main
git pull origin main

# Tạo nhánh mới cho tính năng
git checkout -b feat/ten-tinh-nang
```

**Quy tắc đặt tên nhánh:**
| Loại | Prefix | Ví dụ |
|---|---|---|
| Tính năng mới | `feat/` | `feat/notifications` |
| Sửa lỗi | `fix/` | `fix/login-error` |
| Cải thiện | `chore/` | `chore/update-deps` |

---

## 🗄️ BƯỚC 2: Tạo Bảng Database (Migration)

> Mỗi bảng mới cần 1 file migration — KHÔNG tạo bảng thủ công trên pgAdmin hay Supabase dashboard.

```bash
# Tạo file migration template
npm run db:migrate:create ten_bang_moi
```

File được tạo trong `backend/migrations/`. Bạn điền vào cấu trúc bảng:

```js
// Dùng CommonJS exports (KHÔNG dùng import/export)
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('ten_bang', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),  // ✅ Luôn dùng cái này (không dùng uuid_generate_v4)
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    // ... các cột khác
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('ten_bang');
};
```

```bash
# Chạy migration xuống database LOCAL (Docker)
npm run db:migrate
```

> [!IMPORTANT]
> Lệnh này chỉ chạy trên **Local**. Database Supabase online sẽ được cập nhật **tự động** ở Bước 5 khi merge.

---

## ⚙️ BƯỚC 3: Viết Code Backend

Tạo 4 file theo đúng thứ tự sau (mỗi layer phụ thuộc vào layer bên dưới):

```
Model → Service → Controller → Routes → app.js
```

### 3a. Model (`backend/src/models/tenModel.js`)
> Chỉ chứa các câu SQL query thuần túy.

```js
const { pool } = require('../config/db');

const TenModel = {
  findByUser: async (user_id) => {
    const { rows } = await pool.query(
      `SELECT * FROM ten_bang WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    return rows;
  },
  // ... các hàm khác
};

module.exports = TenModel;
```

### 3b. Service (`backend/src/services/tenService.js`)
> Chứa logic nghiệp vụ (kiểm tra, xử lý, phân tích).

```js
const TenModel = require('../models/tenModel');
const AppError = require('../utils/AppError');

const TenService = {
  getMyItems: async (userId) => {
    return TenModel.findByUser(userId);
  },
  // ... validate, business rules ở đây
};

module.exports = TenService;
```

### 3c. Controller (`backend/src/controllers/tenController.js`)
> Nhận request, gọi Service, trả về response.

```js
const TenService = require('../services/tenService');
const { catchAsync } = require('../utils/catchAsync');

const getMyItems = catchAsync(async (req, res) => {
  const items = await TenService.getMyItems(req.user.id);
  res.json({ status: 'success', results: items.length, data: { items } });
});

module.exports = { getMyItems };
```

### 3d. Routes (`backend/src/routes/tenRoutes.js`)
> Định nghĩa các URL endpoint và gán middleware xác thực.

```js
const express = require('express');
const ctrl = require('../controllers/tenController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(authenticate); // Tất cả route đều cần đăng nhập

router.get('/', ctrl.getMyItems);
// ... các route khác

module.exports = router;
```

### 3e. Đăng ký vào `app.js`

```js
// Thêm 1 dòng import
const tenRoutes = require('./routes/tenRoutes');

// Thêm 1 dòng mount
app.use('/api/ten-chuc-nang', tenRoutes);
```

---

## 🖥️ BƯỚC 4: Viết Code Frontend

Tạo 3 thành phần theo thứ tự:

### 4a. API Service (`frontend/src/services/tenApi.ts`)
> Chứa các hàm gọi API backend bằng Axios.

```ts
import apiClient from './apiClient';
import type { ApiResponse } from '../types';

export interface TenItem {
  id: string;
  // ... các field
}

export const tenApi = {
  getMyItems: async (): Promise<TenItem[]> => {
    const { data } = await apiClient.get<ApiResponse<{ items: TenItem[] }>>('/ten-chuc-nang');
    return data.data!.items;
  },
};
```

### 4b. Page Component (`frontend/src/pages/TenPage.tsx`)
> Component React hiển thị UI và gọi API.

```tsx
import React, { useEffect, useState } from 'react';
import { tenApi, TenItem } from '../services/tenApi';

const TenPage: React.FC = () => {
  const [items, setItems] = useState<TenItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenApi.getMyItems()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ... UI */}
    </div>
  );
};

export default TenPage;
```

### 4c. Đăng ký Route vào `App.tsx`

```tsx
// Import page
import TenPage from './pages/TenPage';

// Thêm route trong phần Protected
<Route path="/ten-chuc-nang" element={<TenPage />} />
```

### 4d. Thêm Link vào Navbar (`Navbar.tsx`)
```tsx
{isAuthenticated && navLink('/ten-chuc-nang', 'Tên Tính Năng')}
```

---

## 🧪 BƯỚC 5: Test Ở Local

```bash
# Chạy toàn bộ dự án (Backend + Frontend cùng lúc)
npm run dev
```

Mở trình duyệt tại `http://localhost:3000` và kiểm tra đầy đủ:
- [ ] Giao diện hiển thị đúng
- [ ] Gọi API thành công (không có lỗi đỏ 5xx trên terminal)
- [ ] Tính năng hoạt động đúng như mong đợi
- [ ] Thêm, xóa, cập nhật dữ liệu phản ánh đúng trên DB

---

## 📤 BƯỚC 6: Commit & Push Lên GitHub

```bash
# Xem lại toàn bộ thay đổi
git status

# Thêm tất cả file vào staging
git add .

# Commit với message rõ ràng
git commit -m "feat: thêm hệ thống thông báo (notifications)"

# Push nhánh lên GitHub (lần đầu cần --set-upstream)
git push --set-upstream origin feat/ten-tinh-nang

# Các lần sau chỉ cần
git push
```

---

## 🔀 BƯỚC 7: Tạo Pull Request & Merge Vào Main

1. Vào **GitHub** → Repository của bạn
2. Sẽ có thông báo **"Compare & pull request"** xuất hiện → Bấm vào
3. Điền tiêu đề và mô tả rõ ràng cho PR
4. Đợi **CI Checks** chạy xong (các dấu tích ✅ xuất hiện)
5. Bấm **"Merge pull request"** → **"Confirm merge"**
6. Xóa nhánh feat sau khi merge (bấm "Delete branch")

---

## ⚡ BƯỚC 8: CI/CD Tự Động Hoàn Tất (Không cần làm gì!)

Ngay sau khi bạn Merge, GitHub Actions tự động chạy:

```
Merge vào main
    ↓
GitHub Actions kích hoạt
    ↓
[Job: backend-ci]  Kiểm tra code backend
[Job: frontend-ci] Kiểm tra code frontend
    ↓
[Job: deploy]
  ├─ npm ci (cài dependencies)
  ├─ npm run db:migrate  ← Tự động tạo bảng mới trên Supabase!
  └─ Render tự động kéo code mới về deploy
    ↓
✅ App online cập nhật hoàn chỉnh
```

> [!TIP]
> Bạn có thể theo dõi tiến trình tại tab **Actions** trên GitHub để xem từng bước đang chạy như thế nào.

---

## 🔄 Sơ Đồ Tóm Tắt Toàn Bộ

```
git checkout -b feat/xxx
         │
         ▼
npm run db:migrate:create  (tạo file migration)
         │
         ▼
Viết code: Model → Service → Controller → Routes → app.js
         │
         ▼
Viết code FE: tenApi.ts → TenPage.tsx → App.tsx → Navbar.tsx
         │
         ▼
npm run dev  (test local)
         │
         ▼
git add . → git commit → git push
         │
         ▼
GitHub: Tạo PR → CI checks → Merge
         │
         ▼
GitHub Actions:
  ✅ db:migrate → Tạo bảng trên Supabase
  ✅ Render tự deploy backend mới
  ✅ Render tự deploy frontend mới
         │
         ▼
🌐 Tính năng live trên internet!
```
