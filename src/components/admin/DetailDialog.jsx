import React from 'react';
import { X } from 'lucide-react';
import Loading from '../Loading';

const DetailDialog = ({ isOpen, onClose, title, data, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-grey-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-primary/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-primary/20 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loading />
          </div>
        ) : (
          <div className="space-y-4">
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <div key={index} className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  {item}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                Không có dữ liệu
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailDialog;


