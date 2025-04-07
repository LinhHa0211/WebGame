import Image from "next/image";
import { GameType } from "./GameList";
import { useRouter } from "next/navigation";
import FavoriteButton from "../button/FavoriteButton";

interface GameProps {
    game: GameType;
    isFavorited: boolean;
    onToggleFavorite: (gameId: string, isFavorited: boolean) => void;
}

const GameListItem: React.FC<GameProps> = ({
    game,
    isFavorited,
    onToggleFavorite
}) => {
    const router = useRouter();

    return (
        <div 
            className="cursor-pointer"
            onClick={() => router.push(`/game/${game.id}`)}
        >
            <div className="relative overflow-hidden aspect-square rounded-xl">
                <Image 
                    fill 
                    src={game.image_url} 
                    sizes="(max-width: 768px) 768px, (max-width: 1200px): 768px, 768px" 
                    className="hover:scale-110 object-cover transition h-full w-full"
                    alt="gameList"
                />
                <FavoriteButton
                    gameId={game.id}
                    isFavorited={isFavorited}
                    onToggleFavorite={onToggleFavorite}
                />
            </div>
            <div className="mt-2">
                <p className="text-lg font-bold">{game.title}</p>
            </div>
            <div className="mt-2">
                <p className="text-sm text-gray-600"><strong>${game.price}</strong></p>
            </div>
        </div>
    );
};

export default GameListItem;