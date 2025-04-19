'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Define the shape of an image object
interface ImageType {
  id: string;
  game: string;
  image_url: string;
}

// Define the props type for the component
interface ImageGalleryProps {
  gameId: string;
}

export default function ImageGallery({ gameId }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageType[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false); // Track if auto-slide is paused
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Store the interval ID

  // Fetch images from the API
  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch(`http://localhost:8000/api/game/image/${gameId}/`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        const data = await response.json();
        setImages(data.data);
        if (data.data.length > 0) {
          setSelectedImage(data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        setError('Failed to load images. Please try again later.');
      }
    }
    fetchImages();
  }, [gameId]);

  // Auto-slide effect
  useEffect(() => {
    if (images.length <= 1 || isPaused) {
      // Don't start auto-slide if there's only one image or if paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Set up the interval for auto-sliding
    intervalRef.current = setInterval(() => {
      setSelectedImage((current) => {
        if (!current) return images[0];
        const currentIndex = images.findIndex((img) => img.id === current.id);
        const nextIndex = (currentIndex + 1) % images.length; // Loop back to first image
        return images[nextIndex];
      });
    }, 5000); // Change image every 5 seconds

    // Clean up the interval on component unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images, isPaused]);

  // Handle thumbnail click
  const handleImageClick = (image: ImageType) => {
    setSelectedImage(image);
    setIsPaused(true); // Pause auto-slide on click
  };

  // Pause auto-slide on hover
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  // Resume auto-slide when hover ends
  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="w-full my-4 sm:my-6">
      {/* Main Image */}
      <div
        className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden mb-4 sm:mb-6"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {selectedImage ? (
          <Image
            src={selectedImage.image_url || '/image_error.jpg'}
            alt="Selected game image"
            fill
            className="object-contain w-full h-full transition-opacity duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl">
            No images available
          </div>
        )}
      </div>

      {/* Thumbnail Scroll */}
      {images.length > 0 && (
        <div
          className="w-full overflow-x-auto no-scrollbar"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex gap-2 sm:gap-3 pb-2 sm:pb-3">
            {images.map((image) => (
              <div
                key={image.id}
                className={`flex-shrink-0 cursor-pointer border-2 rounded-lg transition-colors ${
                  selectedImage?.id === image.id
                    ? 'border-blue-500'
                    : 'border-transparent hover:border-gray-500'
                }`}
                onClick={() => handleImageClick(image)}
              >
                <Image
                  src={image.image_url || '/image_error.jpg'}
                  alt="Thumbnail"
                  width={80}  // Smaller on mobile
                  height={80}
                  className="object-cover rounded-md w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28" // Responsive width and height
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}