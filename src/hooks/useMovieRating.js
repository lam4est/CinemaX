import { useState, useEffect, useRef } from 'react';
import { ratingsAPI } from '../lib/api';

// Cache để tránh fetch lại rating đã fetch rồi
const ratingCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

/**
 * Hook để lấy rating của một phim từ database
 * @param {string} movieId - ID của phim
 * @returns {object} { averageRating, totalRatings, hasRatings, loading }
 */
export const useMovieRating = (movieId) => {
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hasRatings, setHasRatings] = useState(false);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!movieId) return;

    // Kiểm tra cache trước
    const cached = ratingCache.get(movieId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAverageRating(cached.averageRating);
      setTotalRatings(cached.totalRatings);
      setHasRatings(cached.hasRatings);
      return;
    }

    const fetchRating = async () => {
      try {
        setLoading(true);
        const data = await ratingsAPI.getByMovie(movieId);
        const ratings = data.ratings || [];
        const avgRating = data.average_rating || 0;
        const total = data.total_ratings || 0;
        const has = ratings.length > 0;

        // Lưu vào cache
        ratingCache.set(movieId, {
          averageRating: avgRating,
          totalRatings: total,
          hasRatings: has,
          timestamp: Date.now()
        });

        if (mountedRef.current) {
          setAverageRating(avgRating);
          setTotalRatings(total);
          setHasRatings(has);
        }
      } catch (error) {
        console.error('Error fetching movie rating:', error);
        if (mountedRef.current) {
          setHasRatings(false);
          setAverageRating(0);
          setTotalRatings(0);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchRating();

    return () => {
      mountedRef.current = false;
    };
  }, [movieId]);

  return { averageRating, totalRatings, hasRatings, loading };
};

// Function để clear cache khi cần (ví dụ sau khi submit rating)
export const clearRatingCache = (movieId) => {
  if (movieId) {
    ratingCache.delete(movieId);
  } else {
    ratingCache.clear();
  }
};

