'use client';

import Image from 'next/image';
import Link from 'next/link';
import OrderBar from '@/components/game/OrderBar';
import CategorySidebar from '@/components/game/CategorySidebar';
import OperatingSystemSidebar from '@/components/game/OperatingSystemSidebar';
import InfoSidebar from '@/components/game/InfoSidebar';
import Rating from '@/components/game/Rating';
import ImageGallery from '@/components/imagegallery/ImageGallery';
import FavoriteButton from '../button/FavoriteButtonDetail';

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

interface GameDetailClientProps {
  game: Game;
  userId: string | null;
  initialIsFavorite: boolean; // Renamed prop
}

const GameDetailClient: React.FC<GameDetailClientProps> = ({ game, userId }) => {
  return (
    <main className="max-w-[1500px] mx-auto px-6 pb-6">
      <div className="w-full h-[64vh] mb-4 overflow-hidden rounded-xl relative">
        <Image
          fill
          src={game.image_url || '/image_error.jpg'}
          className="object-cover w-full h-full"
          alt="Game"
        />
        <FavoriteButton
          gameId={game.id}
          userId={userId}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="py-6 pr-6 col-span-5">
          <h1 className="mb-4 text-4xl">{game.title}</h1>
          <span className="mb-6 block text-lg text-gray-600">
            <ImageGallery gameId={game.id} />
          </span>
          <hr />
          <Link href={`/publisher/${game.publisher.id}`} className="py-6 flex items-center space-x-4">
            <Image
              src={game.publisher.avatar_url || '/image_error.jpg'}
              width={80}
              height={80}
              className="rounded-full border border-gray-300"
              alt="The publisher name"
            />
            <p className="text-xl">
              <strong>{game.publisher.username}</strong>
            </p>
          </Link>
          <hr />
          <br />
          <OrderBar
            userId={userId}
            game={{
              id: game.id,
              title: game.title,
              price: game.price,
            }}
          />
          <hr />
          <p className="mt-6 text-lg">{game.description}</p>
        </div>
        <aside className="mt-6 p-6 col-span-2">
          <InfoSidebar
            publishYear={game.publish_year}
            purchaseCount={game.purchase_count}
            avg_rating={game.avg_rating}
          />
          <CategorySidebar id={game.id} />
          <OperatingSystemSidebar id={game.id} />
        </aside>
      </div>
      <div className="border rounded-xl p-5 bg-gray-100">
        <Rating id={game.id} avgRating={game.avg_rating} />
      </div>
    </main>
  );
};

export default GameDetailClient;