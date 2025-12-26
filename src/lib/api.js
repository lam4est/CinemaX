/**
 * API service để gọi backend Django
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Helper function để gọi API
 */
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Lấy token từ Clerk nếu có
  const token = localStorage.getItem('clerk_token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Token added to request:', {
      endpoint,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    });
  } else {
    console.warn('⚠️ No token found for request:', endpoint);
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log('API Call:', url, config);
    const response = await fetch(url, config);
    console.log('API Response:', response.status, response.statusText);
    
    if (!response.ok) {
      // Nếu là 401, có thể token đã hết hạn - trigger refresh
      if (response.status === 401) {
        console.warn('⚠️ 401 Unauthorized - Token may be expired, triggering refresh...');
        // Xóa token cũ để trigger refresh
        localStorage.removeItem('clerk_token');
        // Trigger window event để useClerkToken refresh
        window.dispatchEvent(new Event('clerk-token-expired'));
      }
      
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Data:', data);
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

/**
 * Movies API
 */
export const moviesAPI = {
  // Lấy danh sách phim
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/movies${queryString ? `?${queryString}` : ''}`;
    console.log('moviesAPI.getAll - endpoint:', endpoint);
    return apiCall(endpoint);
  },

  // Lấy chi tiết phim
  getById: async (movieId) => {
    return apiCall(`/movies/${movieId}/`);
  },

  // Lấy gợi ý phim
  getRecommendations: async (movieId) => {
    return apiCall(`/movies/${movieId}/recommendations/`);
  },
  
  // Lấy recommendations cho user hiện tại
  getMyRecommendations: async (limit = 10, method = 'hybrid') => {
    return apiCall(`/recommendations/me/?limit=${limit}&method=${method}`);
  },
  
  // Lấy recommendations dựa trên demographic (age + job)
  getDemographicRecommendations: async (limit = 10) => {
    return apiCall(`/recommendations/demographic/?limit=${limit}`);
  },
};

/**
 * Shows API
 */
export const showsAPI = {
  // Lấy shows theo movie
  getByMovie: async (movieId) => {
    return apiCall(`/shows/?movieId=${movieId}`);
  },

  // Lấy layout ghế
  getLayout: async (movieId, datetimeStr) => {
    return apiCall(`/shows/layout/?movieId=${movieId}&datetime_str=${datetimeStr}`);
  },
};

/**
 * Bookings API
 */
export const bookingsAPI = {
  // Lấy bookings của user
  getMyBookings: async () => {
    return apiCall('/bookings/my-bookings/');
  },

  // Tạo booking mới
  create: async (bookingData) => {
    return apiCall('/bookings/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Tạo PayPal order
  createPaypalOrder: async (bookingId) => {
    return apiCall(`/bookings/${bookingId}/paypal/order/`, {
      method: 'POST',
    });
  },

  // Thanh toán
  payment: async (bookingId, paymentData) => {
    return apiCall(`/bookings/${bookingId}/payment/`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
};

/**
 * Favorites API
 */
export const favoritesAPI = {
  // Lấy danh sách favorites
  getAll: async () => {
    return apiCall('/favorites/');
  },

  // Thêm favorite
  add: async (movieId) => {
    return apiCall('/favorites/add/', {
      method: 'POST',
      body: JSON.stringify({ movie_id: movieId }),
    });
  },

  // Xóa favorite
  remove: async (movieId) => {
    return apiCall(`/favorites/${movieId}/`, {
      method: 'DELETE',
    });
  },
};

/**
 * Admin API
 */
export const adminAPI = {
  // Dashboard stats
  getDashboard: async () => {
    return apiCall('/admin/dashboard/');
  },

  // Movies CRUD
  createMovie: async (movieData) => {
    return apiCall('/admin/movies/', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  },

  updateMovie: async (movieId, movieData) => {
    return apiCall(`/admin/movies/${movieId}/`, {
      method: 'PUT',
      body: JSON.stringify(movieData),
    });
  },

  deleteMovie: async (movieId) => {
    return apiCall(`/admin/movies/${movieId}/delete/`, {
      method: 'DELETE',
    });
  },

  // Shows CRUD
  getAllShows: async () => {
    return apiCall('/admin/shows/');
  },

  createShow: async (showData) => {
    return apiCall('/admin/shows/create/', {
      method: 'POST',
      body: JSON.stringify(showData),
    });
  },

  updateShow: async (showId, showData) => {
    return apiCall(`/admin/shows/${showId}/`, {
      method: 'PUT',
      body: JSON.stringify(showData),
    });
  },

  deleteShow: async (showId) => {
    return apiCall(`/admin/shows/${showId}/delete/`, {
      method: 'DELETE',
    });
  },

  // Bookings CRUD
  getAllBookings: async () => {
    return apiCall('/admin/bookings/');
  },

  updateBooking: async (bookingId, bookingData) => {
    return apiCall(`/admin/bookings/${bookingId}/`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  },

  deleteBooking: async (bookingId) => {
    return apiCall(`/admin/bookings/${bookingId}/delete/`, {
      method: 'DELETE',
    });
  },
};

/**
 * User Profile API
 */
export const userProfileAPI = {
  // Lấy profile của user
  getProfile: async () => {
    return apiCall('/user/profile/');
  },

  // Cập nhật profile
  updateProfile: async (profileData) => {
    return apiCall('/user/profile/update/', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },
};

/**
 * Ratings API
 */
export const ratingsAPI = {
  // Lấy ratings của một phim
  getByMovie: async (movieId) => {
    return apiCall(`/ratings/movie/${movieId}/`);
  },

  // Tạo rating mới
  create: async (ratingData) => {
    return apiCall('/ratings/', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },
};

/**
 * Trailers API (nếu có)
 */
export const trailersAPI = {
  getAll: async () => {
    return apiCall('/trailers/');
  },
};

export default {
  moviesAPI,
  showsAPI,
  bookingsAPI,
  favoritesAPI,
  userProfileAPI,
  ratingsAPI,
  adminAPI,
  trailersAPI,
};

