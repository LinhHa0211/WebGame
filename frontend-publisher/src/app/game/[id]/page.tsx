import Image from 'next/image';
import Link from 'next/link';
import OrderBar from '@/components/game/OrderBar';
import CategorySidebar from '@/components/game/CategorySidebar';
import OperatingSystemSidebar from '@/components/game/OperatingSystemSidebar';
import apiService from '@/services/apiService';
import ImageGallery from '@/components/imagegallery/ImageGallery';
import { getUserId } from '@/lib/actions';

interface Publisher {
  id: string;
  name: string;
  avatar_url: string;
}

interface PromotionDetails {
  discount: number;
  promotion_end: string;
}

interface Game {
  id: string;
  title: string;
  image_url: string;
  publisher: Publisher;
  description: string;
  price: number;
  publish_year: string;
  create_at?: string; // Optional, as it's missing in the response
  promotion_details?: PromotionDetails; // Optional, as it's missing currently
}

interface GameResponse {
  data: Game;
}

interface GameDetailPageProps {
  params: { id: string };
}

const GameDetailPage = async ({ params }: GameDetailPageProps) => {
  const userId = await getUserId()

  const game: GameResponse = await apiService.get(`/api/game/${params.id}`);
  if (!game) {
    return <div>Loading...</div>;
  }

  return (
    <main className="max-w-[1500px] mx-auto px-6 pb-6">
      <div className="w-full h-[64vh] mb-4 overflow-hidden rounded-xl relative">
        <Image
          fill
          src={game.data.image_url || '/image_error.jpg'}
          className="object-cover w-full h-full"
          alt="Game"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="py-6 pr-6 col-span-5">
          <h1 className="mb-4 text-4xl">{game.data.title}</h1>
          <span className="mb-6 block text-lg text-gray-600">
            <ImageGallery gameId={game.data.id} />
          </span>
          <hr />
          <Link 
            href={`/publisher/${game.data.publisher.id}`}
            className="py-6 flex items-center space-x-4"
          >
            <Image
              src={game.data.publisher.avatar_url || '/image_error.jpg'}
              width={80}
              height={80}
              className="rounded-full border border-gray-300"
              alt="The publisher name"
            />
            <p className='text-xl'>
              <strong>{game.data.publisher.name}</strong>
            </p>
          </Link>
          <hr />
          <br />
          <OrderBar
            userId={userId}
            game={{
                id: game.data.id,
                title: game.data.title,
                price: game.data.price,
            }}
          />
          <hr />
          <p className="mt-6 text-lg">{game.data.description}</p>
        </div>
        <aside className="mt-6 p-6 col-span-2">
          <CategorySidebar
            id={game.data.id}
          />
          <OperatingSystemSidebar
            id={game.data.id}
          />
        </aside>
      </div>
    </main>
  );
};

export default GameDetailPage;