'use client';

import React from 'react';
import { StoredImageData } from '@/lib/storage';
import { formatDistanceToNow } from 'date-fns';

interface ImageCardProps {
  image: StoredImageData;
  onSelect?: (image: StoredImageData) => void; // Optional: For viewing details
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onSelect }) => {
  const timeAgo = formatDistanceToNow(new Date(image.timestamp), { addSuffix: true });

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 shadow cursor-pointer transition-transform hover:scale-105"
      onClick={() => onSelect?.(image)} // Trigger select action if provided
    >
      <img
        src={image.imageUrl}
        alt={image.prompt}
        className="object-cover w-full h-full transition-opacity group-hover:opacity-80"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-xs font-medium truncate" title={image.prompt}>
          {image.prompt}
        </p>
        <p className="text-gray-300 text-xs">{timeAgo}</p>
      </div>
    </div>
  );
};

export default ImageCard;
