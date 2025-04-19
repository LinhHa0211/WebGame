'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/apiService';
import useLoginModal from '@/hooks/useLoginModal';

interface FavoriteButtonProps {
  gameId: string;
  userId: string | null;
}

export type OrderType = {
  id: string;
  game: { id: string };
  status: string;
};

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ gameId, userId }) => {
  const loginModal = useLoginModal();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch wishlist to determine if the game is favorited
  const getWishlist = async () => {
    if (!userId) {
      setIsFavorited(false);
      return;
    }
    try {
      const response = await apiService.get(`/api/game/${userId}/order/`);
      const orders: OrderType[] = response.data || [];
      const wishlistGameIds = orders
        .filter((order: OrderType) => order.status === 'WL')
        .map((order: OrderType) => order.game.id);
      setIsFavorited(wishlistGameIds.includes(gameId));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setIsFavorited(false);
    }
  };

  useEffect(() => {
    getWishlist();
  }, [userId, gameId]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!userId) {
      loginModal.open();
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiService.post(`/api/game/${gameId}/toggle_favorite/`, {});
      if (response.success) {
        setIsFavorited(response.is_favorited);
        toast.success(
          response.is_favorited
            ? 'Game added to wishlist!'
            : 'Game removed from wishlist!',
          {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'light',
          }
        );
      } else {
        const errorMessage = response.non_field_errors?.[0] || 'Failed to toggle favorite';
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
      }
    } catch (error) {
      toast.error('Error toggling favorite. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 ${
        isFavorited
          ? 'bg-red-500 text-white'
          : 'bg-white bg-opacity-50 text-gray-800 hover:bg-opacity-75'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={userId ? (isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist') : 'Please log in to favorite'}
    >
      <svg
        fill={isFavorited ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-6 h-6 sm:w-8 sm:h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;