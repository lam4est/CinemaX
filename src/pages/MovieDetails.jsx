import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesAPI, showsAPI } from '../lib/api';
import BlurCircle from '../components/BlurCircle';
import { PlayCircleIcon, StarIcon, Heart } from 'lucide-react';
import timeFormat from '../lib/timeFormat';
import DateSelect from '../components/DateSelect';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import RatingSection from '../components/RatingSection';

const MovieDetails = () => {
  const navigate = useNavigate();
  const {id} = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(null); // Rating từ database
  const [hasUserRatings, setHasUserRatings] = useState(false); // Có đánh giá từ user không

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy chi tiết phim
        const movieData = await moviesAPI.getById(id);
        setMovie(movieData);

        // Lấy shows cho phim này (backend trả về dateTime object)
        const showsData = await showsAPI.getByMovie(id);
        // showsData là object với dates làm keys, mỗi key có array of shows
        setShows(showsData);

        // Lấy recommendations (nếu có)
        try {
          const recData = await moviesAPI.getRecommendations(id);
          setRecommendations(recData.results || recData || []);
        } catch (err) {
          console.log('No recommendations available');
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id])

  if (loading || !movie) {
    return <Loading />;
  }

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
        <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
          <img src={movie.poster_path} alt="" className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' />
          <div className='relative flex flex-col gap-3'>
            <BlurCircle top="-100px" left="-100px"/>
            <p className='text-primary'>{movie.original_language?.toUpperCase() || 'ENGLISH'}</p>
            <h1 className='text-4xl font-semibold max-w-96 text-balance'>{movie.title}</h1>
            <div className='flex items-center gap-2 text-gray-300'> 
              <StarIcon className='w-5 h-5 text-primary fill-primary' />
              {hasUserRatings && userRating !== null 
                ? `${userRating.toFixed(1)} User Rating`
                : `${movie.vote_average?.toFixed(1) || '0.0'} User Rating`
              }
              <button
                onClick={() => navigate(`/movies/${id}/reviews`)}
                className='ml-4 text-sm text-primary hover:underline'
              >
                Xem đánh giá
              </button>
            </div>
            <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{movie.overview}</p>

            <p>{timeFormat(movie.runtime)} | {movie.genres?.map(genre => genre.name).join(", ") || 'N/A'} | {movie.release_date?.split("-")[0] || 'N/A'}</p>
            
            <div className='flex items-center flex-wrap gap-4 mt-4'>
              {movie.trailer_url && (
                <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer" className='flex items-center px-3 py-7 gap-2 text-sm bg-grey-800 hover:bg-grey-900 rounded-md active:scale-95 transition font-medium cursor-pointer'>
                  <PlayCircleIcon className='w-5 h-5' /> 
                  Watch Trailer
                </a>
              )}
              <a href="#dateSelect" className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull rounded-md active:scale-95 transition font-medium cursor-pointer'>Buy Tickets</a>
              <button className='bg-grey-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
                <Heart className={`w-5 h-5`} />
              </button>
            </div>
          </div>
        </div>
        
        {movie.casts && movie.casts.length > 0 && (
          <>
            <p className='text-lg font-medium mt-20'>
              Your Favorite Cast
            </p>
            <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
              <div className='flex items-center gap-4 px-4 w-max'>
                {movie.casts.slice(0,12).map((cast, index) => (
                  <div key={index} className='flex flex-col items-center text-center'>
                    <img src={cast.profile_path || 'https://via.placeholder.com/80'} alt={cast.name} className='rounded-full h-20 md:h-20 aspect-square object-cover' />
                    <p className='font-medium text-xs mt-3'>{cast.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <DateSelect dateTime={shows} id={id} movie={movie} />
        
        <RatingSection 
          movieId={id} 
          onRatingUpdate={(avgRating, hasRatings) => {
            setUserRating(avgRating);
            setHasUserRatings(hasRatings);
          }}
        />
        
        {recommendations.length > 0 && (
          <>
            <p className='text-lg font-medium mt-20 mb-8'>
              You might also like
            </p>
            <div className='flex flex-wrap max-sm:justify-center gap-8 items-stretch'> 
              {recommendations.slice(0,4).map((recMovie) => (
                <MovieCard key={recMovie._id} movie={recMovie} />
              ))}
            </div>
          </>
        )}

        <div className='flex justify-center mt-20'>
          <button onClick={() => {navigate('/movies');scrollTo(0,0)}} className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>
            Show more
          </button>
        </div>
    </div>
  )
}

export default MovieDetails