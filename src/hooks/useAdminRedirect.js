import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

/**
 * Hook để check role admin và redirect - tối ưu để load ngay
 */
export const useAdminRedirect = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Chỉ check khi đã loaded và signed in
    if (!isLoaded || !isSignedIn) {
      return;
    }

    // Nếu đang ở trang admin rồi thì không cần redirect
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Tránh redirect nhiều lần
    if (hasRedirectedRef.current) {
      return;
    }

    // Kiểm tra cache ngay lập tức - không cần đợi API
    const cachedRole = localStorage.getItem('user_role');
    const cachedUserId = localStorage.getItem('clerk_user_id');
    const currentUserId = localStorage.getItem('clerk_user_id');
    
    // Nếu có cache và user ID khớp, redirect ngay
    if (cachedRole === 'admin' && cachedUserId === currentUserId) {
      hasRedirectedRef.current = true;
      navigate('/admin', { replace: true });
      return;
    }

    // Nếu không có cache, check API nhưng không block UI
    // Redirect sẽ xảy ra sau khi có kết quả
    const checkRoleAsync = async () => {
      try {
        const token = localStorage.getItem('clerk_token');
        if (!token) {
          return;
        }

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        const response = await fetch(`${API_BASE_URL}/user/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const profile = await response.json();
          const role = profile?.role || 'user';
          
          // Cache role
          localStorage.setItem('user_role', role);
          
          // Redirect nếu là admin và chưa redirect
          if (role === 'admin' && !hasRedirectedRef.current && !location.pathname.startsWith('/admin')) {
            hasRedirectedRef.current = true;
            navigate('/admin', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    };

    // Chạy async, không block
    checkRoleAsync();
  }, [isSignedIn, isLoaded, location.pathname, navigate]);

  // Clear cache khi đăng xuất
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      localStorage.removeItem('user_role');
      hasRedirectedRef.current = false;
    }
  }, [isSignedIn, isLoaded]);
};

