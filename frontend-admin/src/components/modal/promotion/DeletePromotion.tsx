'use client';

import apiService from '@/services/apiService';

interface Promotion {
  id: string;
  title: string;
  start_day: string;
  end_day: string;
}

interface DeletePromotionModalProps {
  promotionToDelete: Promotion | null;
  fetchPromotions: () => Promise<void>;
  closeModals: () => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (value: boolean) => void;
  setPromotionToDelete: (promotion: Promotion | null) => void;
  setFormErrors: (errors: string[]) => void;
}

const DeletePromotionModal: React.FC<DeletePromotionModalProps> = ({
  promotionToDelete,
  fetchPromotions,
  closeModals,
  showDeleteModal,
  setShowDeleteModal,
  setPromotionToDelete,
  setFormErrors,
}) => {
  const handleDeletePromotion = async () => {
    if (!promotionToDelete) return;
    try {
      await apiService.post(`/api/game/promotions/${promotionToDelete.id}/delete/`, {});
      await fetchPromotions();
      closeModals();
    } catch (err: any) {
      setFormErrors([err.message || 'Failed to delete promotion']);
    }
  };

  return (
    <>
      {showDeleteModal && promotionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the promotion{' '}
              <span className="font-semibold">{promotionToDelete.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePromotion}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeletePromotionModal;