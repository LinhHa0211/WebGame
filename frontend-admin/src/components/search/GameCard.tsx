'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/services/apiService';

interface Publisher {
  id: string;
  username: string;
}

interface Game {
  id: string;
  title: string;
  publisher: Publisher;
  price: number;
  avg_rating: number;
  image_url: string;
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

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [promotionDetail, setPromotionDetail] = useState<PromotionDetail | null>(null);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isPromotionActive, setIsPromotionActive] = useState<boolean>(false);

  // Fetch promotion details
  const getPromotionDetail = async () => {
    try {
      const response = await apiService.get(`/api/game/promotion_detail/${game.id}/`);
      setPromotionDetail(response.data);
    } catch (error) {
      console.error('Error fetching promotion detail:', error);
      setPromotionDetail(null);
    }
  };

  // Fetch promotion
  const getPromotion = async () => {
    try {
      const response = await apiService.get(`/api/game/promotion/${game.id}/`);
      setPromotion(response.data);
    } catch (error) {
      console.error('Error fetching promotion:', error);
      setPromotion(null);
    }
  };

  // Calculate time remaining for promotion
  const calculateTimeLeft = () => {
    if (!promotion?.end_day) return '';

    const endDate = new Date(promotion.end_day);
    const now = new Date();
    const difference = endDate.getTime() - now.getTime();

    if (difference <= 0) {
      setIsPromotionActive(false);
      return 'EXPIRED';
    }

    setIsPromotionActive(true);
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  // Initial fetch and setup timer
  useEffect(() => {
    getPromotionDetail();
    getPromotion();

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [game.id, promotion?.end_day]);

  // Calculate discounted price
  const discountedPrice =
    isPromotionActive && promotionDetail?.discount
      ? (game.price * (1 - promotionDetail.discount / 100)).toFixed(2)
      : game.price.toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105 relative">
      {/* Promotion Badge */}
      {isPromotionActive && promotionDetail && (
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            -{promotionDetail.discount}%
          </span>
          <div className="flex items-center bg-yellow-400 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
            <Clock className="w-4 h-4 mr-1" />
            <span>{timeLeft}</span>
          </div>
        </div>
      )}

      {/* Game Image */}
      <div className="relative h-48 w-full">
        <Image
          src={game.image_url || '/defaultgame.jpg'}
          alt={`${game.title} image`}
          layout="fill"
          objectFit="cover"
          className="transition-opacity duration-300 hover:opacity-90"
        />
      </div>

      {/* Game Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{game.title}</h3>
        <Link href={`/publisher/${game.publisher.id}`} className="text-sm text-gray-600 mt-1">
          By {game.publisher.username}
        </Link>
        <div className="flex items-center mt-2">
          <Star className="w-5 h-5 text-yellow-400 mr-1" />
          <span className="text-gray-700">{game.avg_rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          {isPromotionActive && promotionDetail && (
            <p className="text-gray-500 line-through text-sm">${game.price.toFixed(2)}</p>
          )}
          <p className="text-gray-800 font-medium text-lg">${discountedPrice}</p>
        </div>

        {/* View Details Button */}
        <Link href={`/game/${game.id}`}>
          <button className="mt-4 w-full py-2 bg-webgame text-white rounded-lg hover:bg-webgame-dark transition-colors duration-200">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
};

export default GameCard;