import { StarIcon } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom' 
import timeFormat from '../lib/timeFormat';
import { useMovieRating } from '../hooks/useMovieRating';

const MovieCard = ({movie}) => {

    const navigate = useNavigate();
    const { averageRating, hasRatings } = useMovieRating(movie._id);
    
    // Sử dụng rating từ database nếu có, nếu không thì dùng vote_average từ TMDB
    const displayRating = hasRatings && averageRating > 0 
      ? averageRating 
      : (movie.vote_average || 0);

  return (
    <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl
                    hover:-translate-y-1 transition duration-300 w-66 h-full min-h-[420px]'>
         <div className='flex-shrink-0'>
           <img src={movie.backdrop_path} alt=""  
           className='rounded-lg h-52 w-full object-cover object-bottom-right cursor-pointer'
           onClick={() =>{navigate(`/movies/${movie._id}`); scrollTo(0,0)}}/>

           <p className='font-semibold mt-2 truncate'>{movie.title}</p>
           <p className='text-sm text-gray-400 mt-1 line-clamp-2'>{new Date(movie.release_date).getFullYear()} | {movie.genres.slice(0,2).map(genre => genre.name).join(" | ")} | {timeFormat(movie.runtime)}</p>
         </div>

         <div className='flex items-center justify-between mt-auto pt-4'>
            <button onClick={() =>{navigate(`/movies/${movie._id}`); scrollTo(0,0)}}
            className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'> Buy Tickets</button>
            <p className='flex items-center gap-1 text-sm text-gray-400 pr-1'>
                <StarIcon className='w-4 h-4 text-primary fill-primary'/>
                {displayRating.toFixed(1)} 
            </p>
         </div>
    </div>
  )
}

export default MovieCard