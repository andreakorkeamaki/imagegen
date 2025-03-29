'use client';

import React, { useState, useEffect } from 'react';
import { StoredImageData, getStoredImages } from '@/lib/storage';
import ImageCard from './ImageCard';

// Simple pagination state
const ITEMS_PER_PAGE = 8;

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<StoredImageData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<StoredImageData | null>(null);

  // Load images from localStorage on component mount
  useEffect(() => {
    setImages(getStoredImages());
  }, []);

  // Add a listener or mechanism to update the gallery when a new image is added
  // This could be done via a shared state (Context API, Zustand) or event bus
  // For simplicity, we'll assume the parent component might re-fetch or pass updated images.
  // A simple way for now: re-fetch if the component thinks an image *might* have been added
  // This isn't ideal but works for a basic setup.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        // Check if the key matches our storage key
        if (event.key === 'ai-image-gallery') {
             console.log('Storage changed, reloading gallery');
            setImages(getStoredImages());
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentImages = images.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Handle selecting an image for detail view
  const handleSelectImage = (image: StoredImageData) => {
    setSelectedImage(image);
  };

  // Handle closing the detail modal
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Handle downloading an image
  const handleDownloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return <p className="text-gray-500 text-center">No images generated yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {currentImages.map((image) => (
          <ImageCard 
            key={image.id} 
            image={image} 
            onSelect={handleSelectImage}
            onDownload={() => handleDownloadImage(image.imageUrl)}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-sky-100 text-sky-700 rounded hover:bg-sky-200 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-sky-100 text-sky-700 rounded hover:bg-sky-200 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{selectedImage.prompt}</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1 min-h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.prompt}
                  className="max-w-full max-h-[60vh] object-contain" 
                />
              </div>
              <div className="md:w-1/3 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Prompt</h4>
                  <p className="text-gray-800">{selectedImage.prompt}</p>
                </div>
                {selectedImage.negativePrompt && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Negative Prompt</h4>
                    <p className="text-gray-800">{selectedImage.negativePrompt}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Resolution</h4>
                  <p className="text-gray-800">{selectedImage.width} × {selectedImage.height}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Model</h4>
                  <p className="text-gray-800">
                    {selectedImage.model === 'sdxl' ? 'Stable Diffusion XL' : 
                     selectedImage.model === 'recraft-v3' ? 'Recraft V3' : 
                     selectedImage.model || 'Unknown'}
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => handleDownloadImage(selectedImage.imageUrl)}
                    className="w-full px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
