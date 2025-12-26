import React, { useState, useEffect } from 'react'
import { favoritesAPI, moviesAPI } from '../lib/api'
import BlurCircle from '../components/BlurCircle'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import SurveyDialog from '../components/SurveyDialog'

const Favorite = () => {
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('favorites');

  useEffect(() => {
    const fetchData = async () => {
      // Fetch favorites
      try {
        const data = await favoritesAPI.getAll();
        const favoritesList = Array.isArray(data) ? data : (data.results || []);
        const movies = favoritesList.map(fav => fav.movie || fav);
        setFavorites(movies);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }

      // Check user profile từ API
      await checkUserProfile();
    };
    fetchData();
  }, []);

  const checkUserProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/user/profile/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('clerk_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.has_profile && data.age && data.job) {
          setUserProfile({ 
            age: data.age, 
            job: data.job, 
            address: data.address,
            gender: data.gender 
          });
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'recommendations' && userProfile && userProfile.age && userProfile.job) {
      fetchRecommendations();
    }
  }, [activeTab, userProfile]);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const data = await moviesAPI.getDemographicRecommendations(10);
      console.log('Recommendations response:', data);
      
      if (data.message && !data.recommendations) {
        console.log('No recommendations:', data.message);
        setRecommendations([]);
        return;
      }
      
      const recsList = Array.isArray(data.recommendations) 
        ? data.recommendations 
        : (data.results || []);
      setRecommendations(recsList);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSurveySubmit = async (formData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/user/profile/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('clerk_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          age: data.age,
          job: data.job,
          address: data.address
        });
        setShowSurvey(false);
        await fetchRecommendations();
      } else {
        console.error('Error updating profile');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  const handleGetRecommendations = () => {
    if (!userProfile || !userProfile.age || !userProfile.job) {
      setShowSurvey(true);
    } else {
      fetchRecommendations();
    }
  };

  if (loading) {
    return <Loading />;
  }

  const hasFavorites = favorites.length > 0;
  const hasRecommendations = recommendations.length > 0;

  return (
    <>
      <SurveyDialog 
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        onSubmit={handleSurveySubmit}
      />
      
      <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
        <BlurCircle top='150px' left='0px'/>
        <BlurCircle top='50px' left='50px'/>

        {/* Tabs */}
        <div className='flex gap-4 mb-8 border-b border-primary/20'>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'favorites'
                ? 'text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Phim yêu thích
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'recommendations'
                ? 'text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Gợi ý cho bạn
          </button>
        </div>

        {/* Tab Content: Favorites */}
        {activeTab === 'favorites' && (
          <>
            {hasFavorites ? (
              <div className='mb-20'>
                <h1 className='text-xl font-semibold mb-6 text-white'>Phim yêu thích của bạn</h1>
                <div className='flex flex-wrap max-sm:justify-center gap-8 items-stretch'>
                  {favorites.map((movie) => (
                    <MovieCard key={movie._id || movie.id} movie={movie} />  
                  ))}
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-[60vh]'>
                <h1 className='text-3xl font-bold text-center mb-4'>Chưa có phim yêu thích</h1>
                <p className='text-gray-400 text-center'>
                  Thêm phim vào yêu thích để xem lại sau
                </p>
              </div>
            )}
          </>
        )}

        {/* Tab Content: Recommendations */}
        {activeTab === 'recommendations' && (
          <div className='mb-20'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-xl font-semibold text-white'>Gợi ý theo sở thích của bạn</h1>
              {(!userProfile || !userProfile.age || !userProfile.job) && (
                <button
                  onClick={handleGetRecommendations}
                  className='px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white transition-colors text-sm'
                >
                  Nhập thông tin để nhận gợi ý
                </button>
              )}
            </div>

            {loadingRecs ? (
              <Loading />
            ) : hasRecommendations ? (
              <div className='flex gap-8 overflow-x-auto pb-4 scrollbar-hide scroll-smooth'>
                {recommendations.map((movie) => (
                  <div key={movie._id || movie.id} className='flex-shrink-0'>
                    <MovieCard movie={movie} />  
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-[60vh]'>
                {userProfile && userProfile.age && userProfile.job ? (
                  <>
                    <p className='text-gray-400 text-center mb-4'>
                      Đang tải gợi ý cho bạn...
                    </p>
                    <Loading />
                  </>
                ) : (
                  <>
                    <p className='text-gray-400 text-center mb-4'>
                      Nhấn nút "Nhập thông tin để nhận gợi ý" để bắt đầu
                    </p>
                    <button
                      onClick={handleGetRecommendations}
                      className='px-6 py-3 bg-primary hover:bg-primary/80 rounded-lg text-white transition-colors'
                    >
                      Nhập thông tin
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Favorite
