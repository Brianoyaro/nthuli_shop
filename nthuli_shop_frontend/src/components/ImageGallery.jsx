import { useState } from 'react';

export function ImageGallery({ images = [], alt = 'Product' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Use the provided images or create a default one from the first image
  const galleryImages = images && images.length > 0 ? images : [images];

  if (!galleryImages || galleryImages.length === 0) {
    return (
      <div className="bg-gray-200 rounded-lg overflow-hidden">
        <div className="w-full aspect-square bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500">No image available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={galleryImages[selectedIndex]}
          alt={`${alt} ${selectedIndex + 1}`}
          className="w-full aspect-square object-cover"
        />
      </div>

      {/* Thumbnail Navigation */}
      {galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedIndex === index
                  ? 'border-blue-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
