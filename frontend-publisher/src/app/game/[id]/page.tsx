import apiService from '@/services/apiService';
import { getUserId } from '@/lib/actions';
import GameDetailClient from '@/components/game/GameDetailClient';

interface Publisher {
  id: string;
  username: string;
  avatar_url: string;
}

interface PromotionDetails {
  discount: number;
  promotion_end: string;
}

interface RatingData {
  id: string;
  user: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

interface Game {
  id: string;
  title: string;
  image_url: string;
  publisher: Publisher;
  description: string;
  price: number;
  publish_year: string;
  create_at?: string;
  promotion_details?: PromotionDetails;
  avg_rating: number;
  ratings: RatingData[];
  purchase_count: number;
}

interface GameResponse {
  data: Game;
}

interface OrderType {
  id: string;
  game: { id: string };
  status: string;
}

interface GameDetailPageProps {
  params: { id: string };
}

const GameDetailPage = async ({ params }: GameDetailPageProps) => {
  const userId = await getUserId();
  const game: GameResponse = await apiService.get(`/api/game/${params.id}`);
  if (!game) {
    return <div>Loading...</div>;
  }

  // Fetch the user's wishlist to determine if the game is favorited
  let initialIsFavorite = false;
  if (userId) {
    try {
      const response = await apiService.get(`/api/game/${userId}/order/`);
      const orders: OrderType[] = response.data || [];
      const wishlistGameIds = orders
        .filter((order: OrderType) => order.status === 'WL')
        .map((order: OrderType) => order.game.id);
      initialIsFavorite = wishlistGameIds.includes(game.data.id);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  }

  return (
    <GameDetailClient
      game={game.data}
      userId={userId}
      initialIsFavorite={initialIsFavorite}
    />
  );
};

export default GameDetailPage;