# Full-Stack Web App Boilerplate

## Tech Stack
| Layer | Technology |
|---|---|
| Backend | Node.js · Express · JavaScript |
| Database | PostgreSQL (via Docker) |
| Frontend | React · TypeScript · Vite |

---

## 📁 Project Structure

```
e:\Deployment\
├── docker-compose.yml          # PostgreSQL + pgAdmin
├── backend/
│   ├── package.json
│   ├── .env.example            ← copy to .env
│   └── src/
│       ├── app.js              # Express app setup
│       ├── server.js           # Entry point
│       ├── config/
│       │   └── db.js           # PostgreSQL pool
│       ├── models/
│       │   ├── schema.sql      # DB schema (run once)
│       │   └── userModel.js    # Raw SQL queries
│       ├── services/
│       │   ├── authService.js  # Auth business logic
│       │   └── userService.js  # User business logic
│       ├── controllers/
│       │   ├── authController.js
│       │   └── userController.js
│       ├── routes/
│       │   ├── authRoutes.js   # /api/auth/*
│       │   └── userRoutes.js   # /api/users/*
│       ├── middlewares/
│       │   ├── authMiddleware.js        # JWT + RBAC
│       │   ├── errorMiddleware.js       # Global error handler
│       │   └── validationMiddleware.js  # express-validator
│       └── utils/
│           ├── AppError.js     # Custom error class
│           ├── catchAsync.js   # Async wrapper
│           └── helpers.js      # Shared utilities
└── frontend/
    ├── .env.example            ← copy to .env
    └── src/
        ├── App.tsx             # Root + routing
        ├── types/
        │   └── index.ts        # All TS interfaces
        ├── context/
        │   └── AuthContext.tsx # Global auth state
        ├── services/
        │   ├── apiClient.ts    # Axios instance
        │   ├── authService.ts  # Auth API calls
        │   └── userService.ts  # User API calls
        ├── hooks/
        │   ├── useAuth.ts      # Auth with error state
        │   └── useFetch.ts     # Generic data fetcher
        ├── pages/
        │   ├── HomePage.tsx
        │   └── LoginPage.tsx
        ├── components/
        │   ├── layout/
        │   │   └── Navbar.tsx
        │   └── ui/
        │       └── ProtectedRoute.tsx
        └── utils/
            └── helpers.ts
```

---

## 🚀 Getting Started

### 1. Start Database
```bash
# From project root
docker-compose up -d
```
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050` (admin@admin.com / admin)

### 2. Setup Backend
```bash
cd backend
cp .env.example .env     # Edit DB credentials
npm install
# Run schema once:
# Copy & paste schema.sql into pgAdmin query tool, OR:
# psql -U appuser -d appdb -f src/models/schema.sql
npm run dev              # Runs on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # Runs on http://localhost:5173
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Tạo tài khoản mới |
| POST | `/api/auth/login` | Public | Đăng nhập, nhận JWT |
| GET | `/api/auth/me` | 🔒 Auth | Lấy thông tin cá nhân |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | 🔒 Admin | Danh sách tất cả users |
| GET | `/api/users/:id` | 🔒 Auth | Lấy user theo ID |
| PATCH | `/api/users/:id` | 🔒 Auth | Cập nhật user |
| DELETE | `/api/users/:id` | 🔒 Admin | Xóa user |

---

## 🏗️ Architecture Pattern

```
Request → Route → Middleware → Controller → Service → Model → DB
                                    ↓
                              Response (JSON)
```

**Controller-Service-Model (CSM)**:
- **Route**: Định nghĩa endpoint & validation rules
- **Middleware**: JWT auth, validation, error handling
- **Controller**: Nhận request, gọi service, trả response
- **Service**: Business logic, không biết HTTP tồn tại
- **Model**: Raw SQL queries, không biết business logic

---

## ⚙️ Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=appdb
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
