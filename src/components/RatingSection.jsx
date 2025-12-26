import React, { useState, useEffect } from 'react';
import { StarIcon, MessageSquare, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { ratingsAPI } from '../lib/api';
import BlurCircle from './BlurCircle';
import { clearRatingCache } from '../hooks/useMovieRating';

const RatingSection = ({ movieId, onRatingUpdate }) => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [movieId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await ratingsAPI.getByMovie(movieId);
      setRatings(data.ratings || []);
      setAverageRating(data.average_rating || 0);
      setTotalRatings(data.total_ratings || 0);
      
      // Tìm rating của user hiện tại
      const currentUserRating = data.ratings?.find(r => r.user?.email);
      if (currentUserRating) {
        setUserRating(currentUserRating.rating);
        setUserReview(currentUserRating.review || '');
      }
      
      // Thông báo cho parent component về rating
      if (onRatingUpdate) {
        const hasRatings = (data.ratings || []).length > 0;
        onRatingUpdate(data.average_rating || 0, hasRatings);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      // Nếu có lỗi, thông báo không có rating
      if (onRatingUpdate) {
        onRatingUpdate(0, false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('clerk_token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để đánh giá');
        return;
      }

      await ratingsAPI.create({
        movieId: movieId,
        rating: userRating,
        review: userReview,
      });

      toast.success('Đánh giá của bạn đã được lưu!');
      setShowReviewForm(false);
      clearRatingCache(movieId); // Clear cache để refresh rating ở MovieCard
      await fetchRatings(); // Refresh ratings
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.detail || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = interactive 
            ? star <= (hoveredStar || userRating)
            : star <= Math.round(rating);
          
          return (
            <button
              key={star}
              type={interactive ? "button" : undefined}
              onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
              onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
              onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
              disabled={!interactive || isSubmitting}
              className={interactive ? "cursor-pointer transition-all duration-200 hover:scale-125 active:scale-95" : ""}
            >
              <StarIcon
                className={`w-6 h-6 transition-all duration-200 ${
                  isFilled
                    ? 'text-primary fill-primary drop-shadow-lg'
                    : 'text-gray-500'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-20 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700/50 rounded-lg w-64 mb-4"></div>
          <div className="h-6 bg-gray-700/50 rounded-lg w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 py-8 relative">
      <BlurCircle top="-50px" left="-50px" />
      <BlurCircle top="200px" right="-50px" />
      
      {/* Header Section */}
      <div className="relative p-8 bg-primary/10 border border-primary/20 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold">Đánh giá phim</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                {renderStars(averageRating)}
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</span>
                  <span className="text-sm text-gray-400">trên 5.0</span>
                </div>
              </div>
              <div className="h-12 w-px bg-primary/30"></div>
              <div>
                <p className="text-2xl font-bold text-white">{totalRatings}</p>
                <p className="text-sm text-gray-400">đánh giá</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-8 py-3 bg-primary hover:bg-primary-dull rounded-lg transition-all duration-200 text-sm font-semibold active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {showReviewForm ? 'Hủy' : 'Viết đánh giá'}
          </button>
        </div>
      </div>

      {showReviewForm && (
        <div className="mb-8 p-8 bg-primary/10 border border-primary/20 rounded-lg backdrop-blur-sm transition-all duration-300">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Đánh giá của bạn
          </h3>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-300">Chọn số sao *</label>
            <div className="flex items-center gap-4">
              {renderStars(userRating, true, (star) => setUserRating(star))}
              {userRating > 0 && (
                <span className="text-lg font-medium text-primary">
                  {userRating} {userRating === 1 ? 'sao' : 'sao'}
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-300">
              Nhận xét <span className="text-gray-500 font-normal">(tùy chọn)</span>
            </label>
            <textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn về bộ phim... (Tối đa 500 ký tự)"
              maxLength={500}
              className="w-full px-4 py-3 bg-grey-800/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none text-white placeholder-gray-500 transition-all"
              rows="5"
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {userReview.length}/500
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitRating}
              disabled={isSubmitting || userRating === 0}
              className="px-8 py-3 bg-primary hover:bg-primary-dull rounded-lg transition-all duration-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
            <button
              onClick={() => {
                setShowReviewForm(false);
                setUserRating(0);
                setUserReview('');
              }}
              className="px-6 py-3 bg-grey-700 hover:bg-grey-600 rounded-lg transition-all duration-200 text-sm font-medium active:scale-95"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Ratings List */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <div className="text-center py-16 bg-primary/5 border border-primary/10 rounded-lg">
            <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg mb-2">Chưa có đánh giá nào</p>
            <p className="text-gray-500 text-sm">Hãy là người đầu tiên đánh giá bộ phim này!</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Đánh giá từ người xem ({ratings.length})
            </h3>
            {ratings.slice(0, 10).map((rating, index) => (
              <div 
                key={rating._id} 
                className="p-6 bg-grey-800/50 backdrop-blur-sm rounded-lg border border-primary/10 hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {rating.user?.name || rating.user?.email?.split('@')[0] || 'Người dùng'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {rating.created_at 
                          ? new Date(rating.created_at).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(rating.rating)}
                    <span className="text-sm font-medium text-gray-400 ml-2">
                      {rating.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                {rating.review && (
                  <div className="mt-4 pl-13">
                    <p className="text-gray-300 leading-relaxed">{rating.review}</p>
                  </div>
                )}
              </div>
            ))}
            {ratings.length > 10 && (
              <div className="text-center pt-4">
                <button className="text-primary hover:text-primary-dull text-sm font-medium transition-colors">
                  Xem thêm {ratings.length - 10} đánh giá
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RatingSection;

