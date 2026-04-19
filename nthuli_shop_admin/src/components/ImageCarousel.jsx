import React, { useState } from 'react';

export default function ImageCarousel({ images = [], productName = '' }) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600">
        No Images Available
      </div>
    );
  }

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return `${BACKEND_URL}${imageUrl}`;
  };

  const handleImageError = () => {
    console.error('❌ Carousel image failed to load:', {
      src: images[currentIndex]?.imageUrl,
      productName,
    });
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setImageError(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setImageError(false);
  };

  const currentImage = images[currentIndex];
  const fullImageUrl = getFullImageUrl(currentImage?.imageUrl);

  return (
    <div className="w-full space-y-4">
      {/* Main Image Display */}
      <div className="relative w-full bg-gray-200 rounded-lg overflow-hidden">
        <div className="aspect-square flex items-center justify-center bg-gray-100">
          {fullImageUrl && !imageError ? (
            <img
              src={fullImageUrl}
              alt={`${productName} - Image ${currentIndex + 1}`}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
              <div className="text-4xl">⚠️</div>
              <div>Image Failed to Load</div>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition z-10"
              aria-label="Previous image"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition z-10"
              aria-label="Next image"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setImageError(false);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition ${
                index === currentIndex
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <img
                src={getFullImageUrl(image.imageUrl)}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Info */}
      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span className="font-medium">Image URL:</span>
          <span className="text-xs text-gray-500 break-all">{currentImage.imageUrl}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Primary:</span>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
            currentImage.primary
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {currentImage.primary ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
}
