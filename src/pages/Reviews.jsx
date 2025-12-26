import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ratingsAPI, moviesAPI } from '../lib/api';
import Loading from '../components/Loading';
import BlurCircle from '../components/BlurCircle';
import { ArrowLeftIcon, StarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { dateFormat } from '../lib/dateFormat';

const Reviews = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin phim
        const movieData = await moviesAPI.getById(movieId);
        setMovie(movieData);
        
        // Lấy ratings
        const ratingsData = await ratingsAPI.getByMovie(movieId);
        setRatings(ratingsData.ratings || []);
        setAverageRating(ratingsData.average_rating || 0);
        setTotalRatings(ratingsData.total_ratings || 0);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Không thể tải đánh giá');
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchData();
    }
  }, [movieId]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    
    if (userRating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }

    setIsSubmitting(true);
    try {
      await ratingsAPI.create({
        movieId: movieId,
        rating: userRating,
        review: userReview
      });
      
      toast.success('Đánh giá đã được gửi!');
      
      // Reload ratings
      const ratingsData = await ratingsAPI.getByMovie(movieId);
      setRatings(ratingsData.ratings || []);
      setAverageRating(ratingsData.average_rating || 0);
      setTotalRatings(ratingsData.total_ratings || 0);
      
      // Reset form
      setUserRating(0);
      setUserReview('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className='flex gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
            className={interactive ? 'cursor-pointer' : ''}
            disabled={!interactive}
          >
            <StarIcon
              className={`w-5 h-5 ${
                star <= (interactive ? hoveredStar || userRating : rating)
                  ? 'text-primary fill-primary'
                  : 'text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh] pb-20">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0" right="100px" />

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Quay lại</span>
      </button>

      {movie && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={movie.poster_path}
              alt={movie.title}
              className="w-20 h-28 object-cover rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-semibold">{movie.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                {renderStars(Math.round(averageRating))}
                <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({totalRatings} đánh giá)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form đánh giá */}
        <div className="lg:col-span-1">
          <div className="bg-primary/8 border border-primary/20 rounded-lg p-6 sticky top-30">
            <h2 className="text-lg font-semibold mb-4">Viết đánh giá</h2>
            
            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Đánh giá của bạn</label>
                {renderStars(userRating, true, setUserRating)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nhận xét (tùy chọn)</label>
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Chia sẻ suy nghĩ của bạn về bộ phim..."
                  rows={6}
                  className="w-full px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg 
                           focus:outline-none focus:border-primary text-white placeholder-gray-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || userRating === 0}
                className="w-full px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-lg 
                         font-medium cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </div>
        </div>

        {/* Danh sách đánh giá */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-6">
            Tất cả đánh giá ({totalRatings})
          </h2>

          {ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div
                  key={rating._id}
                  className="bg-primary/8 border border-primary/20 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">
                        {rating.user?.name || rating.user?.email || 'Người dùng'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {dateFormat(rating.created_at)}
                      </p>
                    </div>
                    {renderStars(rating.rating)}
                  </div>
                  
                  {rating.review && (
                    <p className="text-gray-300 mt-3 leading-relaxed">
                      {rating.review}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-primary/8 border border-primary/20 rounded-lg p-8 text-center">
              <p className="text-gray-400">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;


