// components/user/PurchaseGame.tsx
"use client";

import { useState, useEffect } from 'react';
import apiService from '@/services/apiService';
import PurchasedGameCard from './PurchaseGameCard';

interface Game {
  id: string;
  title: string;
  image_url: string;
  price: number;
}

interface Order {
  id: string;
  game: Game;
  user: { id: string };
  status: string;
}

interface PurchasedGameListProps {
  userId: string;
}

const PurchasedGameList: React.FC<PurchasedGameListProps> = ({ userId }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchPurchasedGames = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/game/orders/');
      if (response && typeof response === 'object' && 'error' in response) {
        throw new Error(response.error);
      }

      let ordersResponse;
      if (typeof response === 'string') {
        ordersResponse = JSON.parse(response);
      } else {
        ordersResponse = response;
      }

      if (ordersResponse && typeof ordersResponse === 'object' && 'data' in ordersResponse) {
        ordersResponse = ordersResponse.data;
      }

      if (!Array.isArray(ordersResponse)) {
        throw new Error('Expected an array of orders, but received: ' + JSON.stringify(ordersResponse));
      }

      console.log('Orders response:', ordersResponse);
      const purchasedGames = ordersResponse
        .filter((order: Order) => {
          console.log(`Order for user ${order.user.id}, status: ${order.status}`);
          return order.user.id === userId && order.status === 'PAID';
        })
        .map((order: Order) => order.game);

      console.log('Filtered purchased games:', purchasedGames);

      setGames(purchasedGames);
      setError(null);
    } catch (error: any) {
      console.error('Full error details:', error);
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        setTimeout(() => {
          fetchPurchasedGames();
        }, 1000 * (retryCount + 1));
      } else {
        setError(error.message || 'Failed to load purchased games after multiple attempts. Please try again later.');
        setGames([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasedGames();
  }, [userId, retryCount]);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600 font-semibold text-lg">{error}</p>
        <button
          onClick={() => {
            setRetryCount(0);
            fetchPurchasedGames();
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (games.length === 0) {
    return <p className="text-gray-600 text-center text-lg">No purchased games found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <PurchasedGameCard
          key={game.id}
          id={game.id}
          title={game.title}
          image_url={game.image_url}
          price={game.price}
        />
      ))}
    </div>
  );
};

export default PurchasedGameList;