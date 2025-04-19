// components/user/PurchasedGameCard.tsx
"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PurchasedGameCardProps {
  id: string;
  title: string;
  image_url: string;
  price: number;
}

const PurchasedGameCard: React.FC<PurchasedGameCardProps> = ({ id, title, image_url, price }) => {
  const router = useRouter();

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
      onClick={() => router.push(`/game/${id}`)}
    >
      <div className="relative h-48 w-full rounded-t-xl overflow-hidden">
        <Image
          src={image_url || '/defaultgame.jpg'}
          alt={`${title} image`}
          fill
          className="object-cover hover:opacity-90 transition-opacity duration-300"
          priority // Add priority for the first few games
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
      </div>
    </div>
  );
};

export default PurchasedGameCard;