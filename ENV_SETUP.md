# Hướng Dẫn Tạo File .env

## 📝 Frontend (.env trong thư mục CinemaX/)

Tạo file `.env` trong thư mục `CinemaX/` với nội dung sau:

```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZXhjaXRpbmctYnVsbGRvZy00OS5jbGVyay5hY2NvdW50cy5kZXYk

# Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Currency
VITE_CURRENCY=$

# PayPal Sandbox Configuration
VITE_PAYPAL_CLIENT_ID=ARmm63rR_UXM8zDXylEV_V8RPzAxNetXG02hhLBhubvxg7AU87SaNieum_QNrBnnnYDDtxbp7NI4TNbQ
```

**Lưu ý:** 
- File `.env` đã có sẵn template tại `.env.example`
- Copy file `.env.example` thành `.env` và cập nhật giá trị nếu cần
- Key publishable có ký tự `$` ở cuối, nếu lỗi thì bỏ ký tự đó đi

## 📝 Backend (.env trong thư mục AI_DACN/)

Tạo file `.env` trong thư mục `AI_DACN/` với nội dung sau:

```env
# Django Secret Key
SECRET_KEY=your-secret-key-here
DEBUG=True

# MongoDB Configuration
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB_NAME=dacn2
MONGO_USER=
MONGO_PASSWORD=

# Clerk settings
CLERK_JWKS_URL=https://exciting-bulldog-49.clerk.accounts.dev/.well-known/jwks.json
CLERK_PEM_PUBLIC_KEY=
CLERK_SECRET_KEY=sk_test_fl50GTa7gx0ZvlEqcXXqpIvYYfoPy9twmvTX7bAmby

# TMDB API (optional)
TMDB_API_KEY=

# Recommendation System Settings
MIN_RATINGS_PER_USER=5
MIN_RATINGS_PER_MOVIE=10
SIMILARITY_THRESHOLD=0.3

# PayPal Sandbox Configuration
PAYPAL_CLIENT_ID=ARmm63rR_UXM8zDXylEV_V8RPzAxNetXG02hhLBhubvxg7AU87SaNieum_QNrBnnnYDDtxbp7NI4TNbQ
PAYPAL_SECRET=EEpKTiEeG0DC7wsKrwSY45oJ48y9Z6dEKO9VtZ3MvUA4K1xTDN-JeUTLQCnw8wSVwCE-u_IuWIfimuKZ
PAYPAL_BASE_URL=https://api.sandbox.paypal.com

# Email Configuration (để gửi email xác nhận thanh toán)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

**Lưu ý:**
- File `.env.example` đã có sẵn template
- Copy file `.env.example` thành `.env` và cập nhật giá trị
- `CLERK_JWKS_URL` đã được điền sẵn dựa trên publishable key
- `CLERK_SECRET_KEY` đã được điền sẵn
- **Email Configuration**: 
  - Nếu dùng Gmail, cần tạo App Password (không dùng mật khẩu thường)
  - Vào Google Account → Security → 2-Step Verification → App passwords
  - Tạo app password mới và dùng nó cho `EMAIL_HOST_PASSWORD`

## 🚀 Cách Tạo File

### Windows (PowerShell)
```powershell
# Frontend
cd CinemaX
Copy-Item .env.example .env

# Backend
cd ..\AI_DACN
Copy-Item .env.example .env
```

### Linux/Mac
```bash
# Frontend
cd CinemaX
cp .env.example .env

# Backend
cd ../AI_DACN
cp .env.example .env
```

## ✅ Kiểm Tra

Sau khi tạo file `.env`, khởi động lại server để load biến môi trường:

```bash
# Frontend
cd CinemaX
npm run dev

# Backend
cd AI_DACN
python manage.py runserver
```

