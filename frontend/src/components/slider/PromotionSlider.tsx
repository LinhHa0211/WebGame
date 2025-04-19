'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import apiService from '@/services/apiService';

interface Publisher {
  id: string;
  username: string;
}

interface Game {
  id: string;
  title: string;
  price: number;
  image_url: string;
  publisher: Publisher;
  avg_rating: number;
}

interface Promotion {
  id: string;
  title: string;
  start_day: string;
  end_day: string;
}

interface PromotionDetail {
  id: string;
  discount: number;
  game: Game;
  promotion: Promotion;
}

const PromotionSlider: React.FC = () => {
  const router = useRouter();
  const [promotionDetails, setPromotionDetails] = useState<PromotionDetail[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch active promotions
  const fetchActivePromotions = async () => {
    try {
      const response = await apiService.get('/api/game/promotions/active/');
      console.log('Full Response:', response);

      if (!response) {
        throw new Error('No response received from the server');
      }

      if (response && typeof response === 'object' && 'error' in response) {
        throw new Error(response.error);
      }

      if (!Array.isArray(response)) {
        throw new Error('Expected an array of promotion details, but received: ' + JSON.stringify(response));
      }

      const activePromotions = response.filter((detail: PromotionDetail) => {
        const endDate = new Date(detail.promotion.end_day);
        const now = new Date();
        const endDateUTC = Date.UTC(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate(),
          endDate.getUTCHours(),
          endDate.getUTCMinutes(),
          endDate.getUTCSeconds()
        );
        const nowUTC = Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes(),
          now.getUTCSeconds()
        );
        return endDateUTC > nowUTC;
      });

      setPromotionDetails(activePromotions);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching active promotions:', error.message, error);
      setError('Failed to load promotions. Please try again later.');
      setPromotionDetails([]);
    }
  };

  // Calculate time remaining for each promotion
  const calculateTimeLeft = (endDay: string, index: number) => {
    const endDate = new Date(endDay);
    const now = new Date();

    const endDateUTC = Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
      endDate.getUTCHours(),
      endDate.getUTCMinutes(),
      endDate.getUTCSeconds()
    );
    const nowUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    );

    const difference = endDateUTC - nowUTC;

    if (difference <= 0) {
      setTimeLeft((prev) => {
        const newTimeLeft = [...prev];
        newTimeLeft[index] = 'EXPIRED';
        return newTimeLeft;
      });
      return 'EXPIRED';
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    const timeString = `${days}d ${hours}h ${minutes}m`;
    setTimeLeft((prev) => {
      const newTimeLeft = [...prev];
      newTimeLeft[index] = timeString;
      return newTimeLeft;
    });
    return timeString;
  };

  useEffect(() => {
    fetchActivePromotions();
  }, []);

  useEffect(() => {
    if (promotionDetails.length > 0) {
      setTimeLeft(promotionDetails.map(() => ''));
      promotionDetails.forEach((detail, index) => {
        calculateTimeLeft(detail.promotion.end_day, index);
      });

      const timer = setInterval(() => {
        promotionDetails.forEach((detail, index) => {
          calculateTimeLeft(detail.promotion.end_day, index);
        });
      }, 60000);

      return () => clearInterval(timer);
    }
  }, [promotionDetails]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotionDetails.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotionDetails.length) % promotionDetails.length);
  };

  if (error) {
    return <p className="text-red-600 text-center font-semibold">{error}</p>;
  }

  if (promotionDetails.length === 0) {
    return null;
  }

  return (
    <div className="py-8 space-y-2">
      {/* Slider Header */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Big Sales
          </h1>
        </div>
      </header>
        <div className="relative w-full max-w-7xl mx-auto mb-12 px-4">
        {/* Slider Container */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
            <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
            {promotionDetails.map((detail, index) => {
                const discountedPrice = (detail.game.price * (1 - detail.discount / 100)).toFixed(2);
                return (
                <div
                    key={detail.id}
                    className="w-full flex-shrink-0 p-6 bg-white rounded-xl border border-gray-100 hover:scale-105 transition-transform duration-300"
                >
                    <div className="relative">
                    {/* Game Image */}
                    <div className="relative h-96 w-full rounded-lg overflow-hidden bg-gray-100">
                        <Image
                        src={detail.game.image_url || '/defaultgame.jpg'}
                        alt={`${detail.game.title} image`}
                        fill
                        className="object-contain transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                        onClick={() => router.push(`/game/${detail.game.id}`)}
                        />
                        {/* Promotion Badges */}
                        <div className="absolute top-4 left-4 flex items-center space-x-3">
                        <span className="bg-gradient-to-r from-green-500 to-green-700 text-white text-sm font-bold px-3 py-1.5 rounded-full animate-pulse shadow-md">
                            -{detail.discount}%
                        </span>
                        <div className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-sm font-semibold px-3 py-1.5 rounded-full shadow-md">
                            <Clock className="w-5 h-5 mr-1.5" />
                            <span>{timeLeft[index] || 'Loading...'}</span>
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* Game Details */}
                    <div className="mt-5">
                    <h3
                        className="text-xl font-bold text-gray-900 truncate cursor-pointer hover:text-blue-700 transition-colors duration-200"
                        onClick={() => router.push(`/game/${detail.game.id}`)}
                    >
                        {detail.game.title}
                    </h3>
                    <div className="flex items-center space-x-3 mt-3">
                        <p className="text-md text-gray-400 line-through font-medium">
                        ${detail.game.price.toFixed(2)}
                        </p>
                        <p className="text-xl text-red-600 font-extrabold">
                        ${discountedPrice}
                        </p>
                    </div>
                    </div>
                </div>
                );
            })}
            </div>

            {/* Navigation Arrows */}
            {promotionDetails.length > 1 && (
            <>
                <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-700 to-gray-900 text-white p-4 rounded-full hover:bg-opacity-90 transition-all duration-200 shadow-lg"
                >
                <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-700 to-gray-900 text-white p-4 rounded-full hover:bg-opacity-90 transition-all duration-200 shadow-lg"
                >
                <ChevronRight className="w-4 h-4" />
                </button>
            </>
            )}
        </div>
        </div>

      {/* Slide Indicators (Dots) */}
      {promotionDetails.length > 1 && (
        <div className="flex justify-center mt-6 space-x-3">
          {promotionDetails.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionSlider;