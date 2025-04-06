'use client'
import { useEffect, useState } from "react";
import GameListItem from "./GameListItem";
import apiService from "@/services/apiService";

export type GameType ={
    id: string;
    title: string;
    price: number;
    image_url: string;
}

interface GameListProps {
    publisher_id?: string | null;
}

const GameList: React.FC<GameListProps> = ({
    publisher_id
}) => {
    const [games, setGames] = useState<GameType[]>([]);
    const getGames = async () => {
        let url = '/api/game/'
        if (publisher_id){
            url += `?publisher_id=${publisher_id}`
        }
        const tmpGame = await apiService.get(url)
        setGames(tmpGame.data)
    };
    useEffect(() =>{
        getGames()
    }, [])
    return (
        <>
            {games.map((game) => {
                return (
                    <GameListItem
                        key={game.id}
                        game={game}
                    />
                )
            })}
        </>
    )
}

export default GameList;