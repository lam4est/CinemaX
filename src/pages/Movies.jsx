import React, { useState, useEffect } from 'react'
import { moviesAPI } from '../lib/api'
import BlurCircle from '../components/BlurCircle'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { Search } from 'lucide-react'

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await moviesAPI.getAll();
        const moviesList = Array.isArray(data) ? data : (data.results || []);
        setMovies(moviesList);
        setFilteredMovies(moviesList);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]);
        setFilteredMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Filter movies based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMovies(movies);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = movies.filter(movie => 
      movie.title?.toLowerCase().includes(query) ||
      movie.overview?.toLowerCase().includes(query) ||
      movie.genres?.some(genre => genre.name?.toLowerCase().includes(query)) ||
      movie.director?.toLowerCase().includes(query)
    );
    setFilteredMovies(filtered);
  }, [searchQuery, movies]);

  // Phân loại phim: Đang chiếu và Sắp chiếu
  const categorizeMovies = (moviesList) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time để so sánh ngày
    
    const nowShowing = [];
    const comingSoon = [];
    
    moviesList.forEach(movie => {
      let releaseDate = null;
      
      // Lấy release_date từ các field có thể có
      if (movie.release_date) {
        try {
          // Xử lý ISO format với Z
          const dateStr = movie.release_date.replace('Z', '+00:00');
          releaseDate = new Date(dateStr);
        } catch (e) {
          releaseDate = new Date(movie.release_date);
        }
      } else if (movie.releaseDate) {
        try {
          const dateStr = movie.releaseDate.replace('Z', '+00:00');
          releaseDate = new Date(dateStr);
        } catch (e) {
          releaseDate = new Date(movie.releaseDate);
        }
      }
      
      if (releaseDate && !isNaN(releaseDate.getTime())) {
        releaseDate.setHours(0, 0, 0, 0);
        if (releaseDate <= now) {
          nowShowing.push(movie);
        } else {
          comingSoon.push(movie);
        }
      } else {
        // Nếu không có release_date, mặc định là đang chiếu
        nowShowing.push(movie);
      }
    });
    
    console.log('Movies categorized:', {
      total: moviesList.length,
      nowShowing: nowShowing.length,
      comingSoon: comingSoon.length,
      comingSoonMovies: comingSoon.map(m => ({ 
        title: m.title, 
        release_date: m.release_date || m.releaseDate,
        releaseDate: m.releaseDate
      })),
      sampleMovies: moviesList.slice(0, 3).map(m => ({
        title: m.title,
        release_date: m.release_date,
        releaseDate: m.releaseDate,
        hasReleaseDate: !!(m.release_date || m.releaseDate)
      }))
    });
    
    return { nowShowing, comingSoon };
  };

  const { nowShowing, comingSoon } = categorizeMovies(filteredMovies);

  if (loading) {
    return <Loading />;
  }

  return movies.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
        <BlurCircle top='150px' left='0px'/>
        <BlurCircle top='50px' left='50px'/>

        {/* Thanh tìm kiếm */}
        <div className='mb-8'>
          <div className='relative max-w-2xl'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Tìm kiếm phim, diễn viên, đạo diễn...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-12 pr-4 py-3 bg-primary/10 border border-primary/20 rounded-lg 
                         focus:outline-none focus:border-primary text-white placeholder-gray-400'
            />
          </div>
          {searchQuery && (
            <p className='text-sm text-gray-400 mt-2'>
              Tìm thấy {filteredMovies.length} phim
            </p>
          )}
        </div>

        {/* Đang chiếu - Section 1 */}
        {nowShowing.length > 0 && (
          <div className='mb-20'>
            <h1 className='text-xl font-semibold mb-6 text-white'>Đang chiếu</h1>
            <div className='flex gap-8 overflow-x-auto pb-4 scrollbar-hide scroll-smooth'>
              {nowShowing.map((movie) => (
                <div key={movie._id || movie.id} className='flex-shrink-0'>
                  <MovieCard movie={movie} />  
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sắp chiếu - Section 2 */}
        {comingSoon.length > 0 ? (
          <div className='mb-20'>
            <h1 className='text-xl font-semibold mb-6 text-white'>Sắp chiếu</h1>
            <div className='flex gap-8 overflow-x-auto pb-4 scrollbar-hide scroll-smooth'>
              {comingSoon.map((movie) => (
                <div key={movie._id || movie.id} className='flex-shrink-0'>
                  <MovieCard movie={movie} />  
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='mb-20'>
            <h1 className='text-xl font-semibold mb-6 text-white'>Sắp chiếu</h1>
            <div className='bg-primary/8 border border-primary/20 rounded-lg p-8 text-center'>
              <p className='text-gray-400'>Chưa có phim sắp chiếu</p>
              <p className='text-sm text-gray-500 mt-2'>
                Chạy script: python scripts/update_coming_soon_movies.py để thêm phim sắp chiếu
              </p>
            </div>
          </div>
        )}

        {nowShowing.length === 0 && comingSoon.length === 0 && (
          <p className='text-gray-400'>No movies available</p>
        )}
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'> No Movies Available </h1>
    </div>
  )
}

export default Movies