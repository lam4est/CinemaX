import React, { useState, useEffect } from "react";
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  UsersIcon,
  StarIcon
} from "lucide-react";
import { adminAPI } from "../../lib/api";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import DetailDialog from "../../components/admin/DetailDialog";
import { dateFormat } from '../../lib/dateFormat'

const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogData, setDialogData] = useState([]);
  const [dialogLoading, setDialogLoading] = useState(false);

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings || "0",
      icon: ChartLineIcon,
      type: 'bookings',
    },
    {
      title: "Total Revenue",
      value: currency + (dashboardData.totalRevenue || 0),
      icon: CircleDollarSignIcon,
      type: 'revenue',
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows?.length || "0",
      icon: PlayCircleIcon,
      type: 'shows',
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser || "0",
      icon: UsersIcon,
      type: 'users',
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const data = await adminAPI.getDashboard();
      setDashboardData({
        totalBookings: data.totalBookings || 0,
        totalRevenue: data.totalRevenue || 0,
        activeShows: data.activeShows || [],
        totalUser: data.totalUser || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchBookingsDetail = async () => {
    setDialogLoading(true);
    try {
      const bookings = await adminAPI.getAllBookings();
      const formattedData = bookings.map((booking, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-white">{booking.movie?.title || 'N/A'}</p>
              <p className="text-sm text-gray-400">User: {booking.user?.email || booking.user?.name || 'N/A'}</p>
              <p className="text-sm text-gray-400">Seats: {booking.seats?.join(', ') || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary">{currency} {booking.total_price?.toFixed(2) || '0.00'}</p>
              <p className={`text-xs px-2 py-1 rounded ${
                booking.is_paid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {booking.is_paid ? 'Paid' : 'Unpaid'}
              </p>
              <p className={`text-xs px-2 py-1 rounded mt-1 ${
                booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {booking.status || 'pending'}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {booking.booking_date ? new Date(booking.booking_date).toLocaleString('vi-VN') : 'N/A'}
          </p>
        </div>
      ));
      setDialogData(formattedData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setDialogData([<div className="text-red-400">Không thể tải dữ liệu</div>]);
    } finally {
      setDialogLoading(false);
    }
  };

  const fetchRevenueDetail = async () => {
    setDialogLoading(true);
    try {
      const bookings = await adminAPI.getAllBookings();
      const paidBookings = bookings.filter(b => b.is_paid);
      
      // Group by movie
      const revenueByMovie = {};
      paidBookings.forEach(booking => {
        const movieTitle = booking.movie?.title || 'Unknown';
        if (!revenueByMovie[movieTitle]) {
          revenueByMovie[movieTitle] = { count: 0, revenue: 0 };
        }
        revenueByMovie[movieTitle].count += 1;
        revenueByMovie[movieTitle].revenue += booking.total_price || 0;
      });

      const formattedData = Object.entries(revenueByMovie)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .map(([movie, data], index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-white">{movie}</p>
              <p className="text-sm text-gray-400">{data.count} bookings</p>
            </div>
            <p className="font-bold text-primary text-lg">{currency} {data.revenue.toFixed(2)}</p>
          </div>
        ));
      
      if (formattedData.length === 0) {
        setDialogData([<div className="text-gray-400 text-center">Chưa có doanh thu</div>]);
      } else {
        setDialogData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
      setDialogData([<div className="text-red-400">Không thể tải dữ liệu</div>]);
    } finally {
      setDialogLoading(false);
    }
  };

  const fetchShowsDetail = async () => {
    setDialogLoading(true);
    try {
      const shows = await adminAPI.getAllShows();
      const formattedData = shows.map((show, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-semibold text-white">{show.movie?.title || 'N/A'}</p>
              <p className="text-sm text-gray-400">
                {show.showDateTime ? new Date(show.showDateTime).toLocaleString('vi-VN') : 'N/A'}
              </p>
              <p className="text-sm text-gray-400">Price: {currency} {show.showPrice || show.price || '0.00'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">
                Occupied: {Object.keys(show.occupiedSeats || {}).length} seats
              </p>
            </div>
          </div>
        </div>
      ));
      setDialogData(formattedData);
    } catch (error) {
      console.error('Error fetching shows:', error);
      setDialogData([<div className="text-red-400">Không thể tải dữ liệu</div>]);
    } finally {
      setDialogLoading(false);
    }
  };

  const fetchUsersDetail = async () => {
    setDialogLoading(true);
    try {
      // Gọi API để lấy danh sách users (cần tạo endpoint này)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const token = localStorage.getItem('clerk_token');
      const response = await fetch(`${API_BASE_URL}/admin/users/`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (response.ok) {
        const users = await response.json();
        const formattedData = users.map((user, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-white">{user.full_name || user.username || 'N/A'}</p>
                <p className="text-sm text-gray-400">{user.email || 'N/A'}</p>
                {user.role && (
                  <p className={`text-xs px-2 py-1 rounded inline-block mt-1 ${
                    user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.role}
                  </p>
                )}
              </div>
              <div className="text-right text-sm text-gray-400">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
              </div>
            </div>
          </div>
        ));
        setDialogData(formattedData);
      } else {
        setDialogData([<div className="text-gray-400 text-center">Không thể tải danh sách users</div>]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setDialogData([<div className="text-red-400">Không thể tải dữ liệu</div>]);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleCardClick = async (cardType) => {
    setDialogOpen(true);
    setDialogData([]);
    
    switch (cardType) {
      case 'bookings':
        setDialogTitle('Chi tiết Bookings');
        await fetchBookingsDetail();
        break;
      case 'revenue':
        setDialogTitle('Chi tiết Doanh thu');
        await fetchRevenueDetail();
        break;
      case 'shows':
        setDialogTitle('Chi tiết Shows');
        await fetchShowsDetail();
        break;
      case 'users':
        setDialogTitle('Chi tiết Users');
        await fetchUsersDetail();
        break;
      default:
        break;
    }
  };

  return !loading ? (
    <>
      <Title text1="Admin" text2="Dashboard" />
      <div className="relative flex flex-wrap gap-4 mt-6">
        {/* <BlurCircle top="-100px" left="0" /> */}

        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card.type)}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full cursor-pointer hover:bg-primary/20 transition-colors"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-lg font-medium">Active Shows</p>
      <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
        {/* <BlurCircle top="100px" left="-10%" /> */}
        {dashboardData.activeShows && dashboardData.activeShows.length > 0 ? (
          dashboardData.activeShows.map((show) => (
            <div
              key={show._id}
              className="w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
            >
              <img
                src={show.movie?.poster_path}
                alt=""
                className="h-60 w-full object-cover"
              />

              <p className="font-medium p-2 truncate">{show.movie?.title}</p>

              <div className="flex items-center justify-between px-2">
                <p className="text-lg font-medium">
                  {currency} {show.showPrice || show.price}
                </p>

                <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                  <StarIcon className="w-4 h-4 text-primary fill-primary" />
                  {show.movie?.vote_average?.toFixed(1) || '0.0'}
                </p>
              </div>

              <p className="px-2 pt-2 text-sm text-gray-500">
                {dateFormat(show.showDateTime || show.show_datetime)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No active shows</p>
        )}
      </div>

      <DetailDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogTitle}
        data={dialogData}
        loading={dialogLoading}
      />
    </>
  ) : (
    <Loading />
  );
};

export default Dashboard;
