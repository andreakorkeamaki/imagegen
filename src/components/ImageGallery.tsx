'use client';

import React, { useState, useEffect } from 'react';
import { StoredImageData, getStoredImages } from '@/lib/storage';
import ImageCard from './ImageCard';

// Simple pagination state
const ITEMS_PER_PAGE = 8;

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<StoredImageData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Handle selecting an image (e.g., to show details - implement later)
  const handleSelectImage = (image: StoredImageData) => {
    console.log("Selected image:", image);
    // Implement modal display logic here
    alert(`Selected Image Prompt: ${image.prompt}`); // Placeholder
  };

  if (images.length === 0) {
    return <p className="text-gray-500 text-center">No images generated yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {currentImages.map((image) => (
          <ImageCard key={image.id} image={image} onSelect={handleSelectImage} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
