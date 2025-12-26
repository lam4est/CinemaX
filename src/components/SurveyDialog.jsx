import React, { useState } from 'react';
import { X } from 'lucide-react';

const SurveyDialog = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    age: '',
    job: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  const jobs = [
    'student',
    'blue collar',
    'white collar',
    'specialist',
    'teenager'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.age || formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Vui lòng nhập độ tuổi hợp lệ (1-120)';
    }
    
    if (!formData.job) {
      newErrors.job = 'Vui lòng chọn nghề nghiệp';
    }
    
    if (!formData.address || formData.address.trim().length < 3) {
      newErrors.address = 'Vui lòng nhập địa chỉ (ít nhất 3 ký tự)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        age: parseInt(formData.age),
        job: formData.job,
        address: formData.address.trim()
      });
      // Reset form
      setFormData({ age: '', job: '', address: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-primary/95 backdrop-blur-sm rounded-lg p-6 w-full max-w-md mx-4 border border-primary/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Khảo sát người dùng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-300 text-sm mb-6">
          Vui lòng điền thông tin để nhận gợi ý phim phù hợp với bạn
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Độ tuổi <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="120"
              placeholder="Nhập độ tuổi của bạn"
              className={`w-full px-4 py-2 bg-primary/50 border rounded-lg 
                focus:outline-none focus:border-primary text-white placeholder-gray-400
                ${errors.age ? 'border-red-500' : 'border-primary/20'}`}
            />
            {errors.age && (
              <p className="text-red-400 text-xs mt-1">{errors.age}</p>
            )}
          </div>

          {/* Job */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nghề nghiệp <span className="text-red-400">*</span>
            </label>
            <select
              name="job"
              value={formData.job}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-primary/50 border rounded-lg 
                focus:outline-none focus:border-primary text-white
                ${errors.job ? 'border-red-500' : 'border-primary/20'}`}
            >
              <option value="">-- Chọn nghề nghiệp --</option>
              {jobs.map(job => (
                <option key={job} value={job} className="bg-primary">
                  {job.charAt(0).toUpperCase() + job.slice(1)}
                </option>
              ))}
            </select>
            {errors.job && (
              <p className="text-red-400 text-xs mt-1">{errors.job}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Địa chỉ <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ của bạn"
              className={`w-full px-4 py-2 bg-primary/50 border rounded-lg 
                focus:outline-none focus:border-primary text-white placeholder-gray-400
                ${errors.address ? 'border-red-500' : 'border-primary/20'}`}
            />
            {errors.address && (
              <p className="text-red-400 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 
                rounded-lg text-white transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary/80 
                rounded-lg text-white transition-colors"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyDialog;


