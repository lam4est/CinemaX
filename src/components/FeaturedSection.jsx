import { ArrowRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle';
import { moviesAPI } from '../lib/api';
import MovieCard from './MovieCard';
import Loading from './Loading';

const FeaturedSection = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                console.log('FeaturedSection: Fetching movies...');
                const data = await moviesAPI.getAll();
                console.log('FeaturedSection: Received data:', data);
                const moviesList = Array.isArray(data) ? data : (data.results || []);
                console.log('FeaturedSection: Movies list:', moviesList);
                setMovies(moviesList);
            } catch (error) {
                console.error('FeaturedSection: Error fetching movies:', error);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    console.log('FeaturedSection render - movies:', movies, 'loading:', loading, 'count:', movies.length);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
            <div className='relative flex items-center justify-between pt-20 pb-10'>
                <BlurCircle top='0' right='-80px' />
                <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
                <button onClick={()=> navigate('/movies') } className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'>
                    View All 
                    <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>
                </button>
            </div>

            <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8 items-stretch'>
                {movies && movies.length > 0 ? (
                    movies.slice(0, 4).map((movie) => {
                        console.log('Rendering movie:', movie.title, movie._id);
                        return (
                            <MovieCard key={movie._id || movie.id} movie={movie} />
                        );
                    })
                ) : (
                    <div className='w-full text-center'>
                        <p className='text-gray-400'>No movies available</p>
                        <p className='text-gray-500 text-sm mt-2'>Movies count: {movies?.length || 0}</p>
                    </div>
                )}
            </div>

            <div className='flex justify-center mt-20'>
                <button onClick={()=>{navigate('/movies'); scrollTo(0,0)}}
                className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md
                font-medium cursor-pointer'>
                    Show more
                </button>
            </div>
        </div>  
    )
}

export default FeaturedSection