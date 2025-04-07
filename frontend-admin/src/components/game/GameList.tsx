'use client'
import { useEffect, useState } from "react";
import GameListItem from "./GameListItem";
import apiService from "@/services/apiService";
import { getUserId } from "@/lib/actions";

export type GameType = {
    id: string;
    title: string;
    price: number;
    image_url: string;
}

export type OrderType = {
    id: string;
    game: GameType;
    status: string;
    buy_at?: string;
    total_price?: number;
}

interface GameListProps {
    publisher_id?: string | null;
}

const GameList: React.FC<GameListProps> = ({
    publisher_id
}) => {
    const [games, setGames] = useState<GameType[]>([]);
    const [favoritedGameIds, setFavoritedGameIds] = useState<Set<string>>(new Set());
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setUserId(id);
        };
        fetchUserId();
    }, []);

    const getGames = async () => {
        let url = '/api/game/';
        if (publisher_id) {
            url += `?publisher_id=${publisher_id}`;
        }
        const tmpGame = await apiService.get(url);
        setGames(tmpGame.data);
    };

    const getWishlist = async () => {
        if (!userId) return;
        try {
            const response = await apiService.get(`/api/game/${userId}/order/`);
            console.log("Wishlist response:", response);
            const orders: OrderType[] = response.data || [];
            const wishlistGameIds = orders
                .filter((order: OrderType) => order.status === 'WL')
                .map((order: OrderType) => order.game.id);
            setFavoritedGameIds(new Set(wishlistGameIds));
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        }
    };

    useEffect(() => {
        getGames();
    }, []);

    useEffect(() => {
        if (userId) {
            getWishlist();
        }
    }, [userId]);

    return (
        <>
            {games.map((game) => (
                <GameListItem
                    key={game.id}
                    game={game}
                    isFavorited={favoritedGameIds.has(game.id)}
                    onToggleFavorite={(gameId: string, isFavorited: boolean) => {
                        if (isFavorited) {
                            setFavoritedGameIds(prev => {
                                const newSet = new Set(prev);
                                newSet.add(gameId);
                                return newSet;
                            });
                        } else {
                            setFavoritedGameIds(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(gameId);
                                return newSet;
                            });
                        }
                    }}
                />
            ))}
        </>
    );
};

export default GameList;