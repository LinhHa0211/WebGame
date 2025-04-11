'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image'; // Re-add the Image import
import Link from 'next/link';
import apiService from '@/services/apiService';
import { getUserId } from '@/lib/actions';
import useLoginModal from '@/hooks/useLoginModal';

interface User {
  username: string;
  avatar_url: string | null;
}

interface Rating {
  id: string;
  user: User; // Update user to be an object
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

interface RatingProps {
  id: string;
  avgRating: number;
}

const Rating: React.FC<RatingProps> = ({ id, avgRating }) => {
    const loginModal = useLoginModal();

  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch user ID and check purchase status
  const checkPurchaseStatus = async () => {
    try {
      const fetchedUserId = await getUserId();
      setUserId(fetchedUserId);
      if (fetchedUserId) {
        const ordersResponse = await apiService.get(`/api/game/${fetchedUserId}/order/`);
        const orders = ordersResponse.data || [];
        const purchased = orders.some(
          (order: any) => order.game.id === id && order.status === 'PAID'
        );
        setHasPurchased(purchased);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
      setHasPurchased(false);
    }
  };

  // Fetch ratings for the game
  const getRatings = async () => {
    try {
      const response = await apiService.get(`/api/game/${id}/ratings/`);
      setRatings(response.data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setRatings([]);
    }
  };

  useEffect(() => {
    checkPurchaseStatus();
    getRatings();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5.', {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rating: rating.toString(),
        comment: comment || '',
      };

      const response = await apiService.postRating(`/api/game/${id}/rate/`, payload);

      if (response.success) {
        toast.success('Rating submitted successfully!', {
          position: 'top-right',
          autoClose: 5000,
        });
        setComment('');
        setRating(0);
        getRatings(); // Refresh ratings
      } else {
        throw new Error(response.error || 'Failed to submit rating');
      }
    } catch (error: any) {
      console.error('Rating.tsx Submit Error:', error.message || error);
      toast.error(error.message || 'Failed to submit rating.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Display Average Rating */}
      <div className="mb-4 flex flex-wrap items-center space-x-2">
        <span className="text-lg font-semibold">Average Rating:</span>
        <span className="text-lg">{avgRating.toFixed(1)} / 5</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${
                star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Display Ratings */}
      <div className="mt-8 border rounded-lg bg-gray-100">
        <h2 className="px-4 py-3 text-2xl font-semibold border-b">Ratings & Comments</h2>
        {ratings.length > 0 ? (
          <div className="p-4 space-y-4">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="p-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={rating.user.avatar_url || '/image_error.jpg'}
                      width={30}
                      height={30}
                      className="rounded-full border border-gray-300"
                      alt={`${rating.user.username}'s avatar`}
                    />
                    <span className="font-semibold text-gray-800">{rating.user.username}</span>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                {rating.comment && <p className="text-gray-600 mt-1">{rating.comment}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Posted on {new Date(rating.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-gray-600">No ratings yet. Be the first to rate this game!</p>
        )}
      </div>
    </div>
  );
};

export default Rating;