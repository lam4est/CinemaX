import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from "../../assets/assets";
import { useClerk, useUser } from '@clerk/clerk-react';
import { LogOut } from 'lucide-react';

const AdminNavbar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Clear cache
    localStorage.removeItem('clerk_token');
    localStorage.removeItem('clerk_user_id');
    localStorage.removeItem('user_role');
    
    // Sign out từ Clerk
    await signOut();
    
    // Redirect về trang chủ
    navigate('/');
  };

  return (
    <div className='flex items-center justify-between px-6 md:px-10 border-b h-16 border-gray-300/30'>
        <Link to="/admin"> 
          <img src={assets.logo} alt="logo" className='w-36 h-auto' />
        </Link>
        
        <div className='flex items-center gap-4'>
          {user ? (
            <>
              <div className='flex items-center gap-2 text-sm text-gray-300 max-md:hidden'>
                <span>{user.emailAddresses[0]?.emailAddress || 'Admin'}</span>
              </div>
              <button
                onClick={handleSignOut}
                className='flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition text-sm font-medium text-red-400 hover:text-red-300'
              >
                <LogOut className='w-4 h-4' />
                <span className='max-md:hidden'>Đăng xuất</span>
              </button>
            </>
          ) : (
            <div className='text-sm text-gray-400'>Chưa đăng nhập</div>
          )}
        </div>
    </div>
  )
}

export default AdminNavbar