import React, { useState, useEffect } from 'react';
import { moviesAPI, adminAPI } from '../../lib/api';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ListMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await moviesAPI.getAll();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movieId, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phim "${title}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteMovie(movieId);
      toast.success('Xóa phim thành công!');
      fetchMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Không thể xóa phim');
    }
  };

  const filteredMovies = movies.filter(movie =>
    movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.overview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Title text1="Quản lý" text2="Phim" />
      
      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-primary/10 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => navigate('/admin/movies/add')}
          className="px-6 py-2 bg-primary hover:bg-primary-dull rounded-lg transition text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm phim mới
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary/10 border-b border-primary/20">
              <th className="px-4 py-3 text-left text-sm font-semibold">Poster</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tiêu đề</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Thể loại</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Ngày phát hành</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Rating</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovies.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                  {searchQuery ? 'Không tìm thấy phim nào' : 'Chưa có phim nào'}
                </td>
              </tr>
            ) : (
              filteredMovies.map((movie) => (
                <tr key={movie._id} className="border-b border-primary/10 hover:bg-primary/5 transition">
                  <td className="px-4 py-3">
                    <img
                      src={movie.poster_path || 'https://via.placeholder.com/60'}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{movie.title}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{movie.overview}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {movie.genres?.slice(0, 2).map((genre, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary/20 rounded text-xs">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {movie.release_date ? new Date(movie.release_date).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">{movie.vote_average?.toFixed(1) || '0.0'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/movies/edit/${movie._id}`)}
                        className="p-2 bg-primary/20 hover:bg-primary/30 rounded transition"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id, movie.title)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-400">
        Tổng cộng: {filteredMovies.length} phim
      </p>
    </>
  );
};

export default ListMovies;


