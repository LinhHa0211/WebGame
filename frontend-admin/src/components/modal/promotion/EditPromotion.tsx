'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import apiService from '@/services/apiService';

interface Game {
  id: string;
  title: string;
}

interface Promotion {
  id: string;
  title: string;
  start_day: string;
  end_day: string;
}

interface PromotionDetail {
  id: string;
  game: { id: string; title: string };
  discount: number;
  promotion: string;
}

interface GameEntry {
  game_id: string;
  discount: string;
}

interface FormData {
  title: string;
  end_day: string;
  gameEntries: GameEntry[];
}

interface EditPromotionModalProps {
  games: Game[];
  loadingGames: boolean;
  gamesError: string | null;
  promotionToEditId: string | null;
  fetchPromotions: () => Promise<void>;
  closeModals: () => void;
  showEditModal: boolean;
  setShowEditModal: (value: boolean) => void;
  setPromotionToEditId: (id: string | null) => void;
  promotions: Promotion[];
  promotionDetails: PromotionDetail[];
}

const EditPromotionModal: React.FC<EditPromotionModalProps> = ({
  games,
  loadingGames,
  gamesError,
  promotionToEditId,
  fetchPromotions,
  closeModals,
  showEditModal,
  setShowEditModal,
  setPromotionToEditId,
  promotions,
  promotionDetails,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    end_day: '',
    gameEntries: [],
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchPromotionDetails = async (promotionId: string) => {
    try {
      setLoadingDetails(true);
      const response = await apiService.get(`/api/game/promotions/${promotionId}/details/`);
      const details: PromotionDetail[] = response.data || [];
      const gameEntries = details.map((detail) => ({
        game_id: detail.game.id,
        discount: detail.discount.toString(),
      }));
      console.log('Fetched gameEntries:', gameEntries); // Debug log
      return gameEntries.length > 0 ? gameEntries : [{ game_id: games.length > 0 ? games[0].id : '', discount: '' }];
    } catch (err: any) {
      setDetailsError(err.message || 'Failed to fetch promotion details');
      return [{ game_id: games.length > 0 ? games[0].id : '', discount: '' }];
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (showEditModal && promotionToEditId) {
      const loadPromotionData = async () => {
        setDataLoaded(false);
        const promotion = promotions.find((p) => p.id === promotionToEditId);
        if (!promotion) {
          setFormErrors(['Promotion not found']);
          setDataLoaded(true);
          return;
        }
        const gameEntries = await fetchPromotionDetails(promotionToEditId);
        setFormData({
          title: promotion.title,
          end_day: promotion.end_day.split('T')[0],
          gameEntries,
        });
        console.log('Set formData:', {
          title: promotion.title,
          end_day: promotion.end_day.split('T')[0],
          gameEntries,
        }); // Debug log
        setFormErrors([]);
        setDetailsError(null);
        setDataLoaded(true);
      };
      loadPromotionData();
    }
  }, [showEditModal, promotionToEditId, promotions, games]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!dataLoaded) return; // Prevent changes until data is loaded
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log('Updated formData (input change):', updated); // Debug log
      return updated;
    });
  };

  const handleGameEntryChange = (index: number, field: 'game_id' | 'discount', value: string) => {
    if (!dataLoaded) return; // Prevent changes until data is loaded
    const updatedEntries = [...formData.gameEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };

    const gameIds = updatedEntries.map((entry) => entry.game_id);
    const hasDuplicates = new Set(gameIds).size !== gameIds.length;
    if (hasDuplicates) {
      setFormErrors(['Each game can only be selected once']);
    } else {
      setFormErrors([]);
    }

    setFormData((prev) => {
      const updated = { ...prev, gameEntries: updatedEntries };
      console.log('Updated formData (game entry change):', updated); // Debug log
      return updated;
    });
  };

  const addGameEntry = () => {
    if (!dataLoaded) return; // Prevent changes until data is loaded
    setFormData((prev) => {
      const updated = {
        ...prev,
        gameEntries: [...prev.gameEntries, { game_id: games.length > 0 ? games[0].id : '', discount: '' }],
      };
      console.log('Updated formData (add game):', updated); // Debug log
      return updated;
    });
  };

  const removeGameEntry = (index: number) => {
    if (!dataLoaded) return; // Prevent changes until data is loaded
    if (formData.gameEntries.length === 1) {
      setFormErrors(['At least one game is required']);
      return;
    }
    setFormData((prev) => {
      const updatedEntries = prev.gameEntries.filter((_, i) => i !== index);
      const updated = { ...prev, gameEntries: updatedEntries };
      console.log('Updated formData (remove game):', updated); // Debug log
      return updated;
    });
    const updatedEntries = formData.gameEntries.filter((_, i) => i !== index);
    const gameIds = updatedEntries.map((entry) => entry.game_id);
    const hasDuplicates = new Set(gameIds).size !== gameIds.length;
    if (hasDuplicates) {
      setFormErrors(['Each game can only be selected once']);
    } else {
      setFormErrors([]);
    }
  };

  const handleEditPromotion = async (e: FormEvent) => {
    if (!promotionToEditId) {
      setFormErrors(['Promotion to edit is not set']);
      return;
    }
    e.preventDefault();

    const hasInvalidEntries = formData.gameEntries.some((entry) => !entry.game_id || !entry.discount);
    if (hasInvalidEntries) {
      setFormErrors(['Please select a game and enter a discount for each entry']);
      return;
    }

    const gameIds = formData.gameEntries.map((entry) => entry.game_id);
    const hasDuplicatesInForm = new Set(gameIds).size !== gameIds.length;
    if (hasDuplicatesInForm) {
      setFormErrors(['Each game can only be selected once']);
      return;
    }

    // Check if any selected game is already in another promotion (excluding this promotion)
    const otherPromotionDetails = promotionDetails.filter(
      (detail) => detail.promotion !== promotionToEditId
    );
    const usedGameIds = otherPromotionDetails.map((detail) => detail.game.id);
    const selectedGameIds = formData.gameEntries.map((entry) => entry.game_id);
    const alreadyUsedGames = selectedGameIds.filter((gameId) => usedGameIds.includes(gameId));
    if (alreadyUsedGames.length > 0) {
      setFormErrors(['The following games are already in another promotion: ' + alreadyUsedGames.join(', ')]);
      return;
    }

    try {
      const response = await apiService.post(`/api/game/promotions/${promotionToEditId}/update/`, new FormData(e.target as HTMLFormElement));
      if (response.success) {
        await fetchPromotions();
        setPromotionToEditId(null);
        closeModals();
      } else {
        setFormErrors([response.error || 'Failed to update promotion']);
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Failed to update promotion']);
    }
  };

  return (
    <>
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Promotion</h2>
            {loadingDetails || !dataLoaded ? (
              <p className="text-gray-600">Loading promotion details...</p>
            ) : detailsError ? (
              <p className="text-red-600">{detailsError}</p>
            ) : (
              <form onSubmit={handleEditPromotion} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="end_day" className="block text-sm font-medium text-gray-700">
                    End Day
                  </label>
                  <input
                    type="date"
                    id="end_day"
                    name="end_day"
                    value={formData.end_day}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Games and Discounts</label>
                  {formData.gameEntries.map((entry, index) => (
                    <div key={index} className="flex space-x-2 mb-2 items-center">
                      {loadingGames ? (
                        <p className="text-gray-600">Loading games...</p>
                      ) : gamesError ? (
                        <p className="text-red-600">{gamesError}</p>
                      ) : games.length === 0 ? (
                        <p className="text-gray-600">No games available.</p>
                      ) : (
                        <select
                          name={`game_ids[]`}
                          value={entry.game_id}
                          onChange={(e) => handleGameEntryChange(index, 'game_id', e.target.value)}
                          className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                          required
                        >
                          <option value="">Select a game</option>
                          {games
                            .filter(
                              (game) =>
                                // Include games that are in this promotion
                                (formData.gameEntries.some((e) => e.game_id === game.id) ||
                                  // Or games that are not in any other promotion
                                  !promotionDetails.some(
                                    (detail) =>
                                      detail.game.id === game.id &&
                                      detail.promotion !== promotionToEditId
                                  )) &&
                                // Exclude games already selected in this form, except for the current index
                                !formData.gameEntries.some(
                                  (e, i) => i !== index && e.game_id === game.id
                                )
                            )
                            .map((game) => (
                              <option key={game.id} value={game.id}>
                                {game.title}
                              </option>
                            ))}
                        </select>
                      )}
                      <input
                        type="number"
                        name={`discounts[]`}
                        value={entry.discount}
                        onChange={(e) => handleGameEntryChange(index, 'discount', e.target.value)}
                        className="w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                        placeholder="Discount (%)"
                        min="0"
                        max="100"
                        step="0.01"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeGameEntry(index)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addGameEntry}
                    className="px-3 py-1 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-300 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Game</span>
                  </button>
                </div>
                {formErrors.length > 0 && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                    {formErrors.map((err, index) => (
                      <p key={index}>{err}</p>
                    ))}
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EditPromotionModal;