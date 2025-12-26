# Hướng Dẫn Kết Nối Frontend với Backend

## 📋 Tổng Quan

Frontend (React + Vite) đã được thiết lập để kết nối với Backend (Django REST Framework). File API service đã được tạo tại `src/lib/api.js`.

## 🎯 Các Bước Cần Làm Tiếp Theo

### Bước 1: Tạo file `.env` (BẮT BUỘC)
Tạo file `.env` trong thư mục `CinemaX/` với nội dung:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_CURRENCY=$
```

### Bước 2: Cập nhật Components để dùng API
Thay thế dummy data bằng API calls trong các file:
- `src/pages/Home.jsx` - Dùng `moviesAPI.getAll()` thay vì `dummyShowsData`
- `src/pages/Movies.jsx` - Dùng `moviesAPI.getAll()` 
- `src/pages/MovieDetails.jsx` - Dùng `moviesAPI.getById()` và `showsAPI.getByMovie()`
- `src/components/FeaturedSection.jsx` - Dùng `moviesAPI.getAll()`
- `src/pages/admin/Dashboard.jsx` - Dùng `adminAPI.getDashboard()`
- `src/pages/MyBookings.jsx` - Dùng `bookingsAPI.getMyBookings()`
- `src/pages/Favorite.jsx` - Dùng `favoritesAPI.getAll()`

### Bước 3: Test kết nối
1. Khởi động backend: `cd AI_DACN && python manage.py runserver`
2. Khởi động frontend: `cd CinemaX && npm run dev`
3. Mở browser console và test: `moviesAPI.getAll().then(console.log)`

### Bước 4: Xử lý Authentication
Cập nhật Clerk integration để lưu token vào `localStorage` với key `clerk_token` sau khi đăng nhập.

## 🔧 Cấu Hình

### 1. Tạo file `.env` trong thư mục `CinemaX/`

Tạo file `.env` với nội dung sau:

```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Currency
VITE_CURRENCY=$
```

**Lưu ý:** 
- Thay `your_clerk_publishable_key_here` bằng Clerk publishable key thực tế
- Đảm bảo backend đang chạy tại `http://localhost:8000`
- Nếu backend chạy ở port khác, cập nhật `VITE_API_BASE_URL` tương ứng

### 2. Kiểm Tra Backend CORS

Backend đã được cấu hình CORS để cho phép frontend kết nối. Kiểm tra file `AI_DACN/config/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_ALL_ORIGINS = DEBUG  # Allow all origins in debug mode
```

## 🚀 Sử Dụng API Service

### Import API Service

```javascript
import { moviesAPI, showsAPI, bookingsAPI, favoritesAPI, adminAPI } from '../lib/api';
```

### Ví Dụ Sử Dụng

#### Lấy danh sách phim
```javascript
import { moviesAPI } from '../lib/api';

const fetchMovies = async () => {
  try {
    const data = await moviesAPI.getAll();
    console.log('Movies:', data);
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
};
```

#### Lấy chi tiết phim
```javascript
const fetchMovieDetail = async (movieId) => {
  try {
    const data = await moviesAPI.getById(movieId);
    console.log('Movie detail:', data);
  } catch (error) {
    console.error('Error fetching movie detail:', error);
  }
};
```

#### Lấy shows theo movie
```javascript
import { showsAPI } from '../lib/api';

const fetchShows = async (movieId) => {
  try {
    const data = await showsAPI.getByMovie(movieId);
    console.log('Shows:', data);
  } catch (error) {
    console.error('Error fetching shows:', error);
  }
};
```

#### Tạo booking
```javascript
import { bookingsAPI } from '../lib/api';

const createBooking = async (bookingData) => {
  try {
    const data = await bookingsAPI.create({
      movie_id: 'movie_id_here',
      show_id: 'show_id_here',
      seats: ['A1', 'A2'],
      // ... other booking data
    });
    console.log('Booking created:', data);
  } catch (error) {
    console.error('Error creating booking:', error);
  }
};
```

## 📝 Các API Endpoints Có Sẵn

### Movies
- `GET /api/v1/movies/` - Lấy danh sách phim
- `GET /api/v1/movies/{id}/` - Lấy chi tiết phim
- `GET /api/v1/movies/{id}/recommendations/` - Gợi ý phim

### Shows
- `GET /api/v1/shows/?movieId=...` - Lấy shows theo movie
- `GET /api/v1/shows/layout/?movieId=...&datetime_str=...` - Lấy layout ghế

### Bookings
- `GET /api/v1/bookings/my-bookings/` - Lấy bookings của user
- `POST /api/v1/bookings/` - Tạo booking mới

### Favorites
- `GET /api/v1/favorites/` - Lấy danh sách favorites
- `POST /api/v1/favorites/add/` - Thêm favorite
- `DELETE /api/v1/favorites/{movie_id}/` - Xóa favorite

### Admin
- `GET /api/v1/admin/dashboard/` - Dashboard stats
- `GET /api/v1/admin/shows/` - Lấy tất cả shows
- `POST /api/v1/admin/shows/create/` - Tạo show mới

## 🔐 Authentication

API service tự động thêm JWT token vào header nếu có token trong `localStorage` với key `clerk_token`.

Để lưu token sau khi đăng nhập với Clerk:

```javascript
// Sau khi đăng nhập thành công với Clerk
const token = await getToken(); // Clerk function
localStorage.setItem('clerk_token', token);
```

## ✅ Kiểm Tra Kết Nối

1. **Khởi động Backend:**
   ```bash
   cd AI_DACN
   python manage.py runserver
   ```

2. **Khởi động Frontend:**
   ```bash
   cd CinemaX
   npm run dev
   ```

3. **Test API trong browser console:**
   ```javascript
   import { moviesAPI } from './src/lib/api';
   moviesAPI.getAll().then(console.log).catch(console.error);
   ```

## 🐛 Troubleshooting

### Lỗi CORS
- Đảm bảo backend đang chạy và CORS đã được cấu hình
- Kiểm tra `CORS_ALLOW_ALL_ORIGINS = True` trong settings.py nếu ở DEBUG mode

### Lỗi 404
- Kiểm tra `VITE_API_BASE_URL` trong file `.env`
- Đảm bảo backend đang chạy tại đúng URL

### Lỗi Authentication
- Kiểm tra token có trong `localStorage` với key `clerk_token`
- Đảm bảo token format đúng: `Bearer {token}`

