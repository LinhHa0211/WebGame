'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus } from 'lucide-react';
import apiService from '@/services/apiService';
import PromotionModals from '../modal/promotion/PromotionModal';

interface Promotion {
  id: string;
  title: string;
  start_day: string;
  end_day: string;
}

interface Game {
  id: string;
  title: string;
}

interface PromotionDetail {
  id: string;
  game: { id: string; title: string };
  discount: number;
  promotion: string;
}

interface PromotionManagerProps {
  games: Game[];
  loadingGames: boolean;
  gamesError: string | null;
}

const PromotionManager: React.FC<PromotionManagerProps> = ({ games, loadingGames, gamesError }) => {
  const [showPromotions, setShowPromotions] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionDetails, setPromotionDetails] = useState<PromotionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promotionToEditId, setPromotionToEditId] = useState<string | null>(null);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search
  const [sortOption, setSortOption] = useState<string>('title-asc'); // New state for sorting

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/game/promotions/');
      setPromotions(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllPromotionDetails = useCallback(async () => {
    try {
      const detailsPromises = promotions.map((promotion) =>
        apiService.get(`/api/game/promotions/${promotion.id}/details/`).then((response) => response.data || [])
      );
      const detailsArrays = await Promise.all(detailsPromises);
      const allDetails = detailsArrays.flat();
      setPromotionDetails(allDetails);
      console.log('Fetched all promotion details:', allDetails);
    } catch (err: any) {
      console.error('Failed to fetch promotion details:', err);
    }
  }, [promotions]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    if (promotions.length > 0) {
      fetchAllPromotionDetails();
    }
  }, [promotions, fetchAllPromotionDetails]);

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const openEditModal = (promotionId: string) => {
    setPromotionToEditId(promotionId);
    setShowEditModal(true);
  };

  const openDeleteModal = (promotionId: string) => {
    const promotion = promotions.find((p) => p.id === promotionId);
    if (promotion) {
      setShowDeleteModal(true);
      setPromotionToDelete(promotion);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setPromotionToEditId(null);
    setPromotionToDelete(null);
  };

  const filteredAndSortedPromotions = useMemo(() => {
    let filteredPromotions = promotions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredPromotions = promotions.filter((promotion) =>
        promotion.title.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sortedPromotions = [...filteredPromotions];
    switch (sortOption) {
      case 'title-asc':
        sortedPromotions.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sortedPromotions.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'start-day-asc':
        sortedPromotions.sort((a, b) => new Date(a.start_day).getTime() - new Date(b.start_day).getTime());
        break;
      case 'start-day-desc':
        sortedPromotions.sort((a, b) => new Date(b.start_day).getTime() - new Date(a.start_day).getTime());
        break;
      case 'end-day-asc':
        sortedPromotions.sort((a, b) => new Date(a.end_day).getTime() - new Date(b.end_day).getTime());
        break;
      case 'end-day-desc':
        sortedPromotions.sort((a, b) => new Date(b.end_day).getTime() - new Date(a.end_day).getTime());
        break;
      default:
        break;
    }

    return sortedPromotions;
  }, [promotions, searchQuery, sortOption]);

  return (
    <section>
      <div
        className="flex items-center justify-between bg-gray-200 p-4 rounded-t-lg cursor-pointer"
        onClick={() => setShowPromotions(!showPromotions)}
      >
        <h2 className="text-xl font-semibold text-gray-800">Promotions</h2>
        {showPromotions ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </div>
      {showPromotions && (
        <div className="bg-white rounded-b-lg shadow-md p-4">
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search by title"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-8 bg-gray-200 rounded text-gray-800 placeholder-gray-500 focus:outline-none text-sm sm:text-base"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
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
            <div className="w-full sm:w-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full sm:w-auto p-2 pr-8 bg-gray-200 text-gray-800 rounded border border-gray-300 focus:outline-none appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1.5em",
                }}
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="start-day-asc">Start Day (Oldest First)</option>
                <option value="start-day-desc">Start Day (Newest First)</option>
                <option value="end-day-asc">End Day (Oldest First)</option>
                <option value="end-day-desc">End Day (Newest First)</option>
              </select>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Promotion</span>
          </button>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : filteredAndSortedPromotions.length === 0 ? (
            <p className="text-gray-600">No promotions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-800">
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Start Day</th>
                    <th className="py-3 px-4 text-left">End Day</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedPromotions.map((promotion) => (
                    <tr key={promotion.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{promotion.title}</td>
                      <td className="py-3 px-4">{new Date(promotion.start_day).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(promotion.end_day).toLocaleDateString()}</td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button
                          onClick={() => openEditModal(promotion.id)}
                          className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-300"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(promotion.id)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PromotionModals
        games={games}
        loadingGames={loadingGames}
        gamesError={gamesError}
        promotionToEditId={promotionToEditId}
        promotionToDelete={promotionToDelete}
        fetchPromotions={fetchPromotions}
        closeModals={closeModals}
        showAddModal={showAddModal}
        showEditModal={showEditModal}
        showDeleteModal={showDeleteModal}
        setShowAddModal={setShowAddModal}
        setShowEditModal={setShowEditModal}
        setShowDeleteModal={setShowDeleteModal}
        setPromotionToEditId={setPromotionToEditId}
        setPromotionToDelete={setPromotionToDelete}
        promotions={promotions}
        promotionDetails={promotionDetails}
      />
    </section>
  );
};

export default PromotionManager;