import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesAPI, adminAPI } from '../../lib/api';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const AddEditMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: [],
    director: '',
    cast: [],
    release_date: '',
    duration: '',
    rating: '',
    poster_url: '',
    trailer_url: '',
    language: 'en',
    country: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchMovie();
    }
  }, [id]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const movie = await moviesAPI.getById(id);
      
      // Parse genres từ format {id, name} sang array of strings
      const genres = movie.genres?.map(g => g.name) || [];
      
      setFormData({
        title: movie.title || '',
        description: movie.overview || '',
        genre: genres,
        director: movie.director || '',
        cast: movie.casts?.map(c => c.name) || [],
        release_date: movie.release_date ? movie.release_date.split('T')[0] : '',
        duration: movie.runtime || '',
        rating: movie.vote_average || '',
        poster_url: movie.poster_path || '',
        trailer_url: movie.trailer_url || '',
        language: movie.original_language || 'en',
        country: movie.country || '',
      });
    } catch (error) {
      console.error('Error fetching movie:', error);
      toast.error('Không thể tải thông tin phim');
      navigate('/admin/movies');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [name]: items }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        duration: parseInt(formData.duration) || 0,
        rating: parseFloat(formData.rating) || 0.0,
        release_date: formData.release_date ? `${formData.release_date}T00:00:00Z` : null,
      };

      if (isEdit) {
        await adminAPI.updateMovie(id, payload);
        toast.success('Cập nhật phim thành công!');
      } else {
        await adminAPI.createMovie(payload);
        toast.success('Thêm phim thành công!');
      }
      
      navigate('/admin/movies');
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error(error.detail || 'Có lỗi xảy ra khi lưu phim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/movies')}
          className="p-2 hover:bg-primary/20 rounded transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Title text1={isEdit ? 'Sửa' : 'Thêm'} text2="Phim" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Tiêu đề *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thể loại (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={formData.genre.join(', ')}
              onChange={(e) => handleArrayChange('genre', e.target.value)}
              placeholder="Action, Comedy, Drama"
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Đạo diễn</label>
            <input
              type="text"
              name="director"
              value={formData.director}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Diễn viên (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={formData.cast.join(', ')}
              onChange={(e) => handleArrayChange('cast', e.target.value)}
              placeholder="Actor 1, Actor 2, Actor 3"
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ngày phát hành</label>
            <input
              type="date"
              name="release_date"
              value={formData.release_date}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thời lượng (phút)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="10"
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quốc gia</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Poster URL</label>
            <input
              type="url"
              name="poster_url"
              value={formData.poster_url}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Trailer URL</label>
            <input
              type="url"
              name="trailer_url"
              value={formData.trailer_url}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary hover:bg-primary-dull rounded-lg transition text-sm font-medium disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/movies')}
            className="px-6 py-2 bg-grey-700 hover:bg-grey-600 rounded-lg transition text-sm font-medium"
          >
            Hủy
          </button>
        </div>
      </form>
    </>
  );
};

export default AddEditMovie;


