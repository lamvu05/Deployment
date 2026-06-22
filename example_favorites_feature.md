# Hướng Dẫn Từng Bước Phát Triển Tính Năng "Dịch Vụ Yêu Thích" (Favorites)

Tính năng **"Yêu Thích Dịch Vụ" (Favorites/Bookmarks)** là ví dụ thực tế hoàn hảo. Người dùng có thể đánh dấu trái tim các phòng họp/dịch vụ họ thích, thông tin này lưu vào database và đồng bộ hiển thị trên giao diện.

---

## 🛠️ PHẦN I: PHÁT TRIỂN DƯỚI LOCAL (LOCAL DEVELOPMENT)

### 1️⃣ Bước 1: Tạo Database Migration (Tạo Bảng `favorites`)
Sử dụng `node-pg-migrate` để tạo cấu trúc bảng mới dưới máy local.

**Tại thư mục `backend`, chạy lệnh tạo file migration:**
```powershell
npm run db:migrate:create create_favorites_table
```
Hệ thống sẽ tạo ra một file mới có dạng `migrations/XXXXXXXXXXXXX_create_favorites_table.js`. Hãy mở file đó ra và thay thế nội dung bằng:

```javascript
/**
 * Migration: Create Favorites Table
 */
exports.up = (pgm) => {
  pgm.createTable('favorites', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    service_id: {
      type: 'uuid',
      notNull: true,
      references: 'services(id)',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Ràng buộc duy nhất: Một user chỉ được thích một service duy nhất một lần
  pgm.addConstraint('favorites', 'unique_user_service', {
    unique: ['user_id', 'service_id']
  });

  // Tạo Index phục vụ tìm kiếm nhanh
  pgm.createIndex('favorites', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('favorites');
};
```

**Chạy lệnh Migration dưới local để cập nhật Database local của bạn:**
```powershell
npm run db:migrate
```

---

### 2️⃣ Bước 2: Viết Backend API

#### 📄 A. Viết Model (`backend/src/models/favoriteModel.js`)
Tạo file mới này để thực hiện các truy vấn SQL trực tiếp vào PostgreSQL.

```javascript
const { pool } = require('../config/db');

const FavoriteModel = {
  /** Thêm hoặc Xóa trạng thái yêu thích (Toggle Favorite) */
  toggle: async (user_id, service_id) => {
    // 1. Kiểm tra xem đã yêu thích chưa
    const checkRes = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND service_id = $2',
      [user_id, service_id]
    );

    if (checkRes.rows.length > 0) {
      // Đã thích -> Tiến hành XÓA (Unlike)
      await pool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND service_id = $2',
        [user_id, service_id]
      );
      return { favorited: false };
    } else {
      // Chưa thích -> Tiến hành THÊM (Like)
      await pool.query(
        'INSERT INTO favorites (user_id, service_id) VALUES ($1, $2)',
        [user_id, service_id]
      );
      return { favorited: true };
    }
  },

  /** Lấy danh sách tất cả các dịch vụ đã yêu thích của user */
  findByUser: async (user_id) => {
    const { rows } = await pool.query(
      `SELECT f.id AS favorite_id, f.created_at AS favorited_at,
              s.id, s.name, s.description, s.price, s.duration_minutes, s.location, s.image_url
       FROM favorites f
       JOIN services s ON f.service_id = s.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [user_id]
    );
    return rows;
  },

  /** Kiểm tra danh sách các ID dịch vụ đã thích của user (Phục vụ hiển thị icon tim) */
  getUserFavoriteIds: async (user_id) => {
    const { rows } = await pool.query(
      'SELECT service_id FROM favorites WHERE user_id = $1',
      [user_id]
    );
    return rows.map(r => r.service_id);
  }
};

module.exports = FavoriteModel;
```

#### 📄 B. Viết Controller (`backend/src/controllers/favoriteController.js`)
Tạo file mới này để điều phối logic nghiệp vụ và trả phản hồi JSON.

```javascript
const FavoriteModel = require('../models/favoriteModel');

exports.toggleFavorite = async (req, res, next) => {
  try {
    const { service_id } = req.body;
    const user_id = req.user.id; // Lấy từ authMiddleware (jwt)

    if (!service_id) {
      return res.status(400).json({ status: 'fail', message: 'service_id là bắt buộc' });
    }

    const result = await FavoriteModel.toggle(user_id, service_id);
    res.json({
      status: 'success',
      data: result,
      message: result.favorited ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích'
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyFavorites = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const favorites = await FavoriteModel.findByUser(user_id);
    
    res.json({
      status: 'success',
      results: favorites.length,
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};

exports.getFavoriteIds = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const ids = await FavoriteModel.getUserFavoriteIds(user_id);
    res.json({
      status: 'success',
      data: ids
    });
  } catch (error) {
    next(error);
  }
};
```

#### 📄 C. Viết Routes (`backend/src/routes/favoriteRoutes.js`)
Tạo file mới này để định tuyến API:

```javascript
const express = require('express');
const ctrl = require('../controllers/favoriteController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// Tất cả các endpoints yêu thích đều cần phải đăng nhập (authenticate)
router.use(authenticate);

router.post('/toggle', ctrl.toggleFavorite);
router.get('/my', ctrl.getMyFavorites);
router.get('/ids', ctrl.getFavoriteIds);

module.exports = router;
```

#### 📄 D. Tích hợp Route vào App (`backend/src/app.js`)
Mở file `backend/src/app.js` và thêm định tuyến mới:
```javascript
// Thêm ở phía trên cùng với các routes khác:
const favoriteRoutes = require('./routes/favoriteRoutes');

// Đăng ký middleware ở phía dưới (ví dụ tại dòng 48):
app.use('/api/favorites', favoriteRoutes);
```

---

### 3️⃣ Bước 3: Phát Triển Frontend

#### 📄 A. Khai báo Types (`frontend/src/types/index.ts`)
Mở `frontend/src/types/index.ts` và thêm interface ở cuối file:
```typescript
export interface Favorite {
  favorite_id: string;
  favorited_at: string;
  id: string; // service_id
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  location: string | null;
  image_url: string | null;
}
```

#### 📄 B. Tạo Service gọi API (`frontend/src/services/favoriteService.ts`)
Tạo file mới để gửi các request HTTP bằng axios:
```typescript
import apiClient from './apiClient';
import { ApiResponse, Favorite } from '../types';

export const favoriteService = {
  /** Lấy danh sách các ID dịch vụ đã thích */
  getFavoriteIds: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/favorites/ids');
    return response.data?.data || [];
  },

  /** Lấy thông tin đầy đủ các dịch vụ đã thích */
  getMyFavorites: async (): Promise<Favorite[]> => {
    const response = await apiClient.get<ApiResponse<Favorite[]>>('/favorites/my');
    return response.data?.data || [];
  },

  /** Bật/Tắt yêu thích */
  toggleFavorite: async (serviceId: string): Promise<{ favorited: boolean }> => {
    const response = await apiClient.post<ApiResponse<{ favorited: boolean }>>('/favorites/toggle', {
      service_id: serviceId,
    });
    return response.data?.data || { favorited: false };
  },
};
```

#### 📄 C. Tích Hợp UI (Nút Trái Tim trên Card Dịch Vụ)
Trên giao diện hiển thị danh sách phòng họp/dịch vụ, bạn có thể tạo một nút bấm hình Trái tim:

```tsx
import React, { useState, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService';

interface FavoriteHeartProps {
  serviceId: string;
  initialFavorited: boolean;
}

export const FavoriteHeart: React.FC<FavoriteHeartProps> = ({ serviceId, initialFavorited }) => {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Tránh kích hoạt sự kiện click của Card
    if (loading) return;
    setLoading(true);
    try {
      const res = await favoriteService.toggleFavorite(serviceId);
      setIsFavorited(res.favorited);
    } catch (err) {
      console.error('Lỗi toggle yêu thích:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle} 
      className={`favorite-btn ${isFavorited ? 'active' : ''}`}
      disabled={loading}
    >
      {isFavorited ? '❤️' : '🤍'}
    </button>
  );
};
```

---

## 🚀 PHẦN II: QUY TRÌNH ĐƯA LÊN PRODUCTION (DEPLOYMENT STEPS)

Sau khi tính năng đã chạy hoàn hảo và test không lỗi gì ở local, đây là các bước để bạn đưa nó lên trang web thực tế đã được deploy.

### 🌐 Bước 1: Đồng bộ Database Lên Supabase (Database Cloud)

Vì Backend trên Render cần truy cập bảng `favorites` mới này, bạn phải chạy migration lên Supabase trước.

1. **Lấy Connection String:** Vào Supabase -> Project Settings -> Database -> Copy mục **Connection String (URI)**.
2. **Chạy Migration:** Mở terminal local tại thư mục `backend`, chạy lệnh:
   ```bash
   # Thay thế bằng URI thật của Supabase của bạn
   DATABASE_URL="postgresql://postgres.xxx:mypassword@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" npm run db:migrate
   ```
3. **Xác nhận:** Truy cập dashboard Supabase, vào **Table Editor** kiểm tra xem bảng `favorites` đã xuất hiện chưa.

---

### 🖥️ Bước 2: Commit & Đẩy Code Lên GitHub

Đẩy tất cả code thay đổi lên nhánh chính `main` của dự án.

```bash
# Đang đứng tại thư mục gốc của dự án
git add .
git commit -m "feat: hoàn thành tích hợp tính năng yêu thích dịch vụ"
git push origin main
```

---

### ⚙️ Bước 3: Kích Hoạt Tự Động Build Và Deploy

#### 1. Trên GitHub Actions (CI/CD)
Ngay sau khi bạn push, GitHub Actions sẽ tự khởi chạy file `ci-cd.yml`:
* Chạy Type check cho React (Frontend)
* Chạy Build thử Frontend.
* Nếu CI báo xanh nghĩa là code không có lỗi TypeScript hay lỗi biên dịch.

#### 2. Trên Render (Backend)
* Nếu bạn bật **Auto-Deploy**, Render sẽ nhận diện commit mới trên `main`, tự động kéo code về, chạy lại server NodeJS.
* Nếu tắt Auto-Deploy: Bạn truy cập [dashboard.render.com](https://dashboard.render.com) -> Chọn Web Service của bạn -> Bấm **Manual Deploy** -> Chọn **Deploy latest commit**.
* *Lưu ý:* Kiểm tra Tab **Logs** trên Render để đảm bảo Backend chạy thành công mà không bị crash.

#### 3. Trên Vercel (Frontend)
* Vercel luôn tự động Deploy khi thấy có commit mới trên nhánh `main`. Bạn chỉ cần đợi 1 - 2 phút cho quá trình build hoàn tất. Giao diện web thật sẽ tự cập nhật phiên bản mới nhất.

---

### 🧪 Bước 4: Kiểm thử thực tế (Post-Deployment Test)

1. Truy cập vào domain thực tế của Frontend (Vercel).
2. Đăng nhập tài khoản của bạn.
3. Click thử nút **Yêu thích (❤️)** trên một dịch vụ/phòng họp.
4. Tải lại trang (F5) xem biểu tượng trái tim có giữ nguyên trạng thái không (chứng minh API đã lưu dữ liệu và trả về chính xác).
5. Mở tab Network trong F12 kiểm tra xem có request nào tới endpoint `/api/favorites/` bị báo lỗi đỏ CORS hay không.
