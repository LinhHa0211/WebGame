'use client';

import { toast } from "react-toastify";
import apiService from "@/services/apiService";
import useLoginModal from "@/hooks/useLoginModal";

interface FavoriteButtonProps {
    gameId: string;
    isFavorited: boolean;
    onToggleFavorite: (gameId: string, isFavorited: boolean) => void;
    userId?: string | null; // Add userId prop
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
    gameId,
    isFavorited,
    onToggleFavorite,
    userId
}) => {
    const loginModal = useLoginModal();

    const handleToggle = async () => {
        // If user is not logged in, open the login modal
        if (!userId) {
            loginModal.open();
            return;
        }

        try {
            const response = await apiService.post(`/api/game/${gameId}/toggle_favorite/`, {});
            if (response.success) {
                onToggleFavorite(gameId, response.is_favorited);
                toast.success(
                    response.is_favorited
                        ? "Game added to wishlist!"
                        : "Game removed from wishlist!",
                    {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "light",
                    }
                );
            } else {
                const errorMessage = response.non_field_errors?.[0] || "Failed to toggle favorite";
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                });
            }
        } catch (error) {
            toast.error("Error toggling favorite. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });
            console.error("Error toggling favorite:", error);
        }
    };

    return (
        <div
            className={`absolute top-2 right-2 ${isFavorited ? 'text-webgame border-white' : 'text-white border-webgame'} hover:text-webgame cursor-pointer`}
            onClick={(e) => {
                e.stopPropagation();
                handleToggle();
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isFavorited ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
            </svg>
        </div>
    );
};

export default FavoriteButton;