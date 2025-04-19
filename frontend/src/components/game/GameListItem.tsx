'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import FavoriteButton from '../button/FavoriteButton';
import { useState, useEffect } from 'react';
import apiService from '@/services/apiService';
import { Clock } from 'lucide-react';

interface Publisher {
  id: string;
  username: string;
}

interface PromotionDetails {
  id: string;
  discount: number;
  game: { id: string; title: string; price: number };
  promotion: Promotion;
}

interface Promotion {
  id: string;
  title: string;
  start_day: string;
  end_day: string;
}

export type GameType = {
  id: string;
  title: string;
  price: number;
  image_url: string;
  publisher: Publisher;
  avg_rating: number;
  category_ids?: string[];
  operating_system_ids?: string[];
};

interface GameProps {
  game: GameType;
  isFavorited: boolean;
  onToggleFavorite: (gameId: string, isFavorited: boolean) => void;
  userId?: string | null;
}

const GameListItem: React.FC<GameProps> = ({
  game,
  isFavorited,
  onToggleFavorite,
  userId,
}) => {
  const router = useRouter();
  const [promotionDetail, setPromotionDetail] = useState<PromotionDetails | null>(null);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isPromotionActive, setIsPromotionActive] = useState<boolean>(false);

  // Fetch promotion details
  const getPromotionDetail = async () => {
    try {
      const response = await apiService.get(`/api/game/promotion_detail/${game.id}/`);
      console.log(`Game ${game.title} promotion_detail:`, response.data);
      setPromotionDetail(response.data);
    } catch (error) {
      console.error(`Error fetching promotion detail for ${game.title}:`, error);
      setPromotionDetail(null);
    }
  };

  // Fetch promotion
  const getPromotion = async () => {
    try {
      const response = await apiService.get(`/api/game/promotion/${game.id}/`);
      console.log(`Game ${game.title} promotion:`, response.data);
      setPromotion(response.data);
    } catch (error) {
      console.error(`Error fetching promotion for ${game.title}:`, error);
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

  useEffect(() => {
    getPromotionDetail();
    getPromotion();

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [game.id, promotion?.end_day]);

  const discountedPrice =
    isPromotionActive && promotionDetail?.discount
      ? (game.price * (1 - promotionDetail.discount / 100)).toFixed(2)
      : game.price.toFixed(2);

  return (
    <div className="cursor-pointer" onClick={() => router.push(`/game/${game.id}`)}>
      <div className="relative overflow-hidden aspect-square rounded-xl">
        <Image
          fill
          src={game.image_url}
          sizes="(max-width: 768px) 768px, (max-width: 1200px): 768px, 768px"
          className="hover:scale-110 object-cover transition h-full w-full"
          alt="gameList"
        />
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
        <FavoriteButton
          gameId={game.id}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          userId={userId}
        />
      </div>
      <div className="mt-2">
        <p className="text-lg font-bold">{game.title}</p>
      </div>
      <div className="mt-1 flex justify-between items-center">
        <div className="flex items-center">
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-4 h-4 text-yellow-500 mr-1"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          <p className="text-sm text-gray-600">{game.avg_rating.toFixed(1)}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isPromotionActive && promotionDetail ? (
            <>
              <p className="text-sm text-gray-500 line-through">
                ${game.price.toFixed(2)}
              </p>
              <p className="text-sm text-red-500 font-bold">
                ${discountedPrice}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600 font-bold">
              ${game.price.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameListItem;