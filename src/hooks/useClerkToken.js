import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

/**
 * Hook để lấy token từ Clerk và lưu vào localStorage
 */
export const useClerkToken = () => {
  const { getToken, isSignedIn, userId, isLoaded } = useAuth();
  const retryCountRef = useRef(0);

  useEffect(() => {
    // Đợi Clerk load xong
    if (!isLoaded) {
      return;
    }

    const updateToken = async (retry = false) => {
      if (isSignedIn && userId) {
        try {
          // Lấy token với skipCache để đảm bảo lấy token mới nhất
          // Đặc biệt quan trọng sau khi sign up
          const token = await getToken({ skipCache: true });
          
          if (token) {
            const previousToken = localStorage.getItem('clerk_token');
            const previousUserId = localStorage.getItem('clerk_user_id');
            const isNewUser = !previousUserId || previousUserId !== userId;
            
            localStorage.setItem('clerk_token', token);
            localStorage.setItem('clerk_user_id', userId); // Lưu user ID để check
            retryCountRef.current = 0; // Reset retry count khi thành công
            console.log('✅ Clerk token saved to localStorage', {
              userId,
              tokenLength: token.length,
              tokenPreview: token.substring(0, 30) + '...',
              retry,
              isNewUser,
              previousUserId
            });
            
            // Sau khi lưu token, trigger một API call để tạo/update user trong DB và lấy role
            // Chạy khi: user mới, token mới, hoặc lần đầu
            if (isNewUser || !previousToken || !retry) {
              // Gọi ngay lập tức, không delay - chạy async không block
              (async () => {
                try {
                  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
                  // Gọi API để trigger authentication và tạo user, đồng thời lấy role
                  const response = await fetch(`${API_BASE_URL}/user/profile/`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  if (response.ok) {
                    const profile = await response.json();
                    // Cache role ngay lập tức để useAdminRedirect có thể dùng
                    if (profile.role) {
                      localStorage.setItem('user_role', profile.role);
                      console.log('✅ User role cached:', profile.role);
                      
                      // Nếu là admin và đang ở trang chủ, redirect ngay
                      if (profile.role === 'admin' && window.location.pathname === '/') {
                        window.location.href = '/admin';
                      }
                    }
                  } else {
                    console.warn('⚠️ API call failed but token saved:', response.status);
                  }
                } catch (e) {
                  console.log('⚠️ Could not trigger user creation:', e);
                }
              })();
            }
          } else {
            console.warn('⚠️ Clerk token is null');
            localStorage.removeItem('clerk_token');
            
            // Retry nếu chưa retry quá 5 lần (tăng lên cho sign up)
            if (!retry && retryCountRef.current < 5) {
              retryCountRef.current++;
              console.log(`🔄 Retrying to get token (attempt ${retryCountRef.current})...`);
              setTimeout(() => updateToken(true), 1000);
            }
          }
        } catch (error) {
          console.error('❌ Error getting Clerk token:', error);
          localStorage.removeItem('clerk_token');
          
          // Retry nếu chưa retry quá 5 lần
          if (!retry && retryCountRef.current < 5) {
            retryCountRef.current++;
            console.log(`🔄 Retrying to get token after error (attempt ${retryCountRef.current})...`);
            setTimeout(() => updateToken(true), 1000);
          }
        }
      } else {
        // Xóa token khi đăng xuất
        console.log('🚪 User signed out, removing token');
        localStorage.removeItem('clerk_token');
        localStorage.removeItem('clerk_user_id');
        retryCountRef.current = 0;
      }
    };

    // Cập nhật token ngay lập tức
    updateToken();
    
    // Listen for token expired event
    const handleTokenExpired = () => {
      console.log('🔄 Token expired event received, refreshing token...');
      retryCountRef.current = 0;
      updateToken(true);
    };
    window.addEventListener('clerk-token-expired', handleTokenExpired);
    
    // Cập nhật token định kỳ (mỗi 4 phút để tránh token hết hạn)
    const interval = setInterval(() => {
      retryCountRef.current = 0; // Reset retry count mỗi lần update định kỳ
      updateToken(true); // Skip cache để lấy token mới
    }, 4 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('clerk-token-expired', handleTokenExpired);
    };
  }, [getToken, isSignedIn, userId, isLoaded]);
};

