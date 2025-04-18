'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import UserGameListItem from "@/components/userlib/UserGameListItem";
import apiService from "@/services/apiService";
import { getUserId } from "@/lib/actions";
import useAddGameModal from "@/hooks/useAddGameModal";

export type GameType = {
    id: string;
    title: string;
    price: number;
    image_url: string;
    publish_year: string; // Changed from number to string to match API and form
    purchase_count: number;
    avg_rating: number;
    approval: string;
    approval_description?: string;
    description: string;
}

export type UserDetailType = {
    id: string;
    username: string;
    avatar_url: string;
}

export type CategoryType = {
    id: string;
    title: string;
}

export type OperatingSystemType = {
    id: string;
    title: string;
}

const UserLibPage = () => {
    const addGameModal = useAddGameModal();
    const [userId, setUserId] = useState<string | null>(null);
    const [userDetail, setUserDetail] = useState<UserDetailType | null>(null);
    const [games, setGames] = useState<GameType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [operatingSystems, setOperatingSystems] = useState<OperatingSystemType[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

    const getUserDetail = async (userId: string) => {
        try {
            const response = await apiService.get(`/api/auth/${userId}/`);
            setUserDetail(response);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const getGames = async () => {
        try {
            const tmpGame = await apiService.get(`/api/game/${userId}/publishergame/`);
            setGames(tmpGame.data);
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    };

    const getCategories = async () => {
        try {
            const response = await apiService.get('/api/game/category/');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const getOperatingSystems = async () => {
        try {
            const response = await apiService.get('/api/game/operatingSystem/');
            setOperatingSystems(response.data);
        } catch (error) {
            console.error("Error fetching operating systems:", error);
        }
    };

    // Callback to update a game in the state
    const updateGame = (updatedGame: GameType | null) => {
        setGames((prevGames) => {
            if (updatedGame === null) {
                // Remove game (for deletion)
                return prevGames.filter((game) => game.id !== prevGames.find(g => g.id === game.id)?.id);
            }
            // Update or add game
            return prevGames.map((game) =>
                game.id === updatedGame.id ? { ...game, ...updatedGame } : game
            );
        });
    };

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setUserId(id);
        };
        fetchUserId();
    }, []);

    useEffect(() => {
        if (userId !== null) {
            getUserDetail(userId);
            getGames();
            getCategories();
            getOperatingSystems();
            setFilter('APPROVED');
        }
    }, [userId]);

    // Filter games based on current filter state
    const filteredGames = filter === 'ALL'
        ? games
        : games.filter(game => game.approval === filter);

    return (
        <main className="max-w-[1500px] mx-auto px-4 sm:px-6 pb-6">
            {/* Header Section */}
            <div className="flex items-center p-3 sm:p-4 bg-gray-800 rounded-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 flex items-center justify-center relative overflow-hidden aspect-square rounded-xl">
                    {userDetail ? (
                        <Image
                            fill
                            src={userDetail.avatar_url || '/defaultavatar.jpg'}
                            className="hover:scale-110 object-cover transition h-full w-full"
                            alt="User Profile"
                            sizes="48px"
                        />
                    ) : (
                        <Image
                            fill
                            src="/image_error.jpg"
                            className="hover:scale-110 object-cover transition h-full w-full"
                            alt="User Profile"
                            sizes="48px"
                        />
                    )}
                </div>
                <h1 className="ml-3 sm:ml-4 text-xl sm:text-2xl font-bold text-white truncate">
                    {userDetail ? userDetail.username : 'Loading...'}
                </h1>
            </div>

            {/* Navigation Section */}
            <div className="p-4 px-2 border-b border-gray-700">
                {/* Dropdown for mobile */}
                <div className="block sm:hidden">
                    <div>
                        <button
                            onClick={() => addGameModal.open()}
                            className={`w-full px-4 py-2 mb-2 rounded text-white bg-webgame hover:bg-webgame-dark`}
                        >
                            Publish New Game
                        </button>
                    </div>
                    <select
                        onChange={(e) => setFilter(e.target.value as 'APPROVED' | 'PENDING' | 'REJECTED')}
                        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none appearance-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "1.5em",
                        }}
                    >
                        <option value="APPROVED">All Games</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                {/* Buttons for larger screens */}
                <div className="hidden sm:flex sm:flex-row items-center justify-between space-x-2">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('APPROVED')}
                            className={`w-[160px] px-4 py-2 rounded text-white ${filter === 'APPROVED' ? 'bg-blue-600' : 'bg-gray-800'}`}
                        >
                            All Games
                        </button>
                        <button
                            onClick={() => setFilter('PENDING')}
                            className={`w-[160px] px-4 py-2 rounded text-white ${filter === 'PENDING' ? 'bg-blue-600' : 'bg-gray-800'}`}
                        >
                            Pending Games
                        </button>
                        <button
                            onClick={() => setFilter('REJECTED')}
                            className={`w-[160px] px-4 py-2 rounded text-white ${filter === 'REJECTED' ? 'bg-blue-600' : 'bg-gray-800'}`}
                        >
                            Rejected List
                        </button>
                    </div>
                    <button
                        onClick={() => addGameModal.open()}
                        className={`w-[160px] px-4 py-2 rounded text-white bg-webgame hover:bg-webgame-dark`}
                    >
                        Publish New Game
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center p-4">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Find a game"
                        className="w-full p-2 pl-8 bg-gray-700 rounded text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5 sm:w-6 sm:h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                            />
                        </svg>
                    </span>
                </div>
            </div>

            {/* Game Cards */}
            <div className="space-y-4">
                {filteredGames.map((game) => (
                    <UserGameListItem
                        key={game.id}
                        game={game}
                        updateGame={updateGame}
                        categories={categories}
                        operatingSystems={operatingSystems}
                    />
                ))}
            </div>
        </main>
    );
};

export default UserLibPage;