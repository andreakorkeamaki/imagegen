'use client';

import React from 'react';
import { StoredImageData } from '@/lib/storage';
import { formatDistanceToNow } from 'date-fns';

interface ImageCardProps {
  image: StoredImageData;
  onSelect?: (image: StoredImageData) => void; // Optional: For viewing details
  onDownload?: (image: StoredImageData) => void; // Optional: For downloading image
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onSelect, onDownload }) => {
  const timeAgo = formatDistanceToNow(new Date(image.timestamp), { addSuffix: true });
  
  // Get a display name for the model
  const getModelDisplayName = (modelId?: string) => {
    if (!modelId) return 'Unknown Model';
    switch (modelId) {
      case 'sdxl': return 'Stable Diffusion XL';
      case 'recraft-v3': return 'Recraft V3';
      default: return modelId;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click from bubbling to parent when clicking download button
    e.stopPropagation();
    onSelect?.(image);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    onDownload?.(image);
  };

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 shadow cursor-pointer transition-transform hover:scale-105"
      onClick={handleClick}
    >
      <img
        src={image.imageUrl}
        alt={image.prompt}
        className="object-cover w-full h-full transition-opacity group-hover:opacity-80"
      />
      {/* Model badge */}
      {image.model && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {getModelDisplayName(image.model)}
        </div>
      )}
      {/* Download button */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDownload}
          className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full shadow-md transition-colors"
          aria-label="Download image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-xs font-medium truncate" title={image.prompt}>
          {image.prompt}
        </p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-gray-300 text-xs">{timeAgo}</p>
          <p className="text-gray-300 text-xs">{image.width}×{image.height}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
