'use client';

import { useState, useEffect } from 'react';
import apiService from "@/services/apiService";
import useLoginModal from '@/hooks/useLoginModal';
import LoginModal from '../modal/LoginModal';
import { toast } from 'react-toastify';

interface Game {
    id: string;
    title: string;
    price: number;
}

interface Promotion {
    id: string;
    title: string;
    start_day: string;
    end_day: string;
}

interface PromotionDetail {
    id: string;
    discount: number;
    game: Game;
    promotion: Promotion;
}

interface OrderBarProps {
    userId: string | null;
    game: Game;
}

const OrderBar: React.FC<OrderBarProps> = ({
    game,
    userId
}) => {
    const loginModal = useLoginModal();

    const [promotionDetail, setPromotionDetail] = useState<PromotionDetail | null>(null);
    const [promotion, setPromotion] = useState<Promotion | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isPromotionActive, setIsPromotionActive] = useState<boolean>(false);

    // Fetch promotion details
    const getPromotionDetail = async () => {
        try {
            const response = await apiService.get(`/api/game/promotion_detail/${game.id}/`);
            setPromotionDetail(response.data);
        } catch (error) {
            console.error('Error fetching promotion detail:', error);
            setPromotionDetail(null);
        }
    };

    // Fetch promotion
    const getPromotion = async () => {
        try {
            const response = await apiService.get(`/api/game/promotion/${game.id}/`);
            setPromotion(response.data);
        } catch (error) {
            console.error('Error fetching promotion:', error);
            setPromotion(null);
        }
    };

    // Calculate time remaining for promotion
    const calculateTimeLeft = () => {
        if (!promotion?.end_day) return '';
        
        const endDate = new Date(promotion.end_day);
        const now = new Date();
        const difference = endDate.getTime() - now.getTime();

        if (difference <= 0) {
            setIsPromotionActive(false);
            return 'EXPIRED';
        }

        setIsPromotionActive(true);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${days}d ${hours}h ${minutes}m`;
    };

    // Initial fetch and setup timer
    useEffect(() => {
        getPromotionDetail();
        getPromotion();
        
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000);

        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [game.id, promotion?.end_day]);

    // Calculate discounted price
    const discountedPrice = isPromotionActive && promotionDetail?.discount 
        ? (game.price * (1 - promotionDetail.discount / 100)).toFixed(2)
        : game.price.toFixed(2);

    const performOrder = async () => {
        if (userId) {
            const formData = new FormData();
            formData.append('total_price', discountedPrice.toString());

            try {
                const response = await apiService.post(`/api/game/order/${game.id}/`, formData);
                console.log('API Response:', response); // Debug the response

                if (response.success) {
                    toast.success('Game buy successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                    });
                } else if (response.error === 'You have already ordered this game') {
                    toast.error('You have already ordered this game', {
                        position: "top-right",
                        autoClose: 5000,
                    });
                } else {
                    toast.error(response.error || 'Something went wrong. Please try again.', {
                        position: "top-right",
                        autoClose: 5000,
                    });
                }
            } catch (error) {
                console.error('Order failed:', error);
                toast.error('Order failed. Please try again later.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } else {
            loginModal.open();
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg p-4">
            <h1 className="text-lg font-bold text-gray-800 mb-4">
                BUY {game.title.toUpperCase()}
            </h1>

            {promotionDetail && promotion && isPromotionActive && (
                <div className="bg-gray-700 text-white text-sm font-semibold rounded-t-lg px-4 py-2">
                    <p>SPECIAL PROMOTION! OFFER ENDS IN {timeLeft}</p>
                </div>
            )}

            <div
                className={`flex items-center justify-between p-4 ${
                    isPromotionActive && promotionDetail ? 'bg-gray-700 rounded-b-lg' : 'bg-transparent'
                }`}
            >
                <div className="flex items-center space-x-2">
                    {isPromotionActive && promotionDetail && (
                        <span className="bg-green-500 text-white text-sm font-bold px-2 py-1 rounded">
                            -{promotionDetail.discount}%
                        </span>
                    )}
                    <div>
                        {isPromotionActive && promotionDetail && (
                            <p className="text-gray-400 line-through text-sm">
                                ${game.price.toFixed(2)}
                            </p>
                        )}
                        <p className={`text-lg font-bold ${
                            isPromotionActive && promotionDetail ? 'text-white' : 'text-gray-800'
                        }`}>
                            ${discountedPrice}
                        </p>
                    </div>
                </div>
                <button
                    className={`text-white font-semibold py-2 px-4 rounded-xl transition-colors ${
                        isPromotionActive && promotionDetail 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-pink-600 hover:bg-pink-700'
                    }`}
                >
                    Buy
                </button>
            </div>
        </div>
    );
};

export default OrderBar;