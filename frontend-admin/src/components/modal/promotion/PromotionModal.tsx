'use client';

import { useState } from 'react';

import AddPromotionModal from './AddPromotion';
import EditPromotionModal from './EditPromotion';
import DeletePromotionModal from './DeletePromotion';

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

interface PromotionModalsProps {
  games: Game[];
  loadingGames: boolean;
  gamesError: string | null;
  promotionToEditId: string | null;
  promotionToDelete: Promotion | null;
  fetchPromotions: () => Promise<void>;
  closeModals: () => void;
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  setShowAddModal: (value: boolean) => void;
  setShowEditModal: (value: boolean) => void;
  setShowDeleteModal: (value: boolean) => void;
  setPromotionToEditId: (id: string | null) => void;
  setPromotionToDelete: (promotion: Promotion | null) => void;
  promotions: Promotion[];
  promotionDetails: PromotionDetail[];
}

const PromotionModals: React.FC<PromotionModalsProps> = ({
  games,
  loadingGames,
  gamesError,
  promotionToEditId,
  promotionToDelete,
  fetchPromotions,
  closeModals,
  showAddModal,
  showEditModal,
  showDeleteModal,
  setShowAddModal,
  setShowEditModal,
  setShowDeleteModal,
  setPromotionToEditId,
  setPromotionToDelete,
  promotions,
  promotionDetails,
}) => {
  const [formErrors, setFormErrors] = useState<string[]>([]);

  return (
    <>
      <AddPromotionModal
        games={games}
        loadingGames={loadingGames}
        gamesError={gamesError}
        fetchPromotions={fetchPromotions}
        closeModals={closeModals}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        promotionDetails={promotionDetails} // Pass promotionDetails
      />
      <EditPromotionModal
        games={games}
        loadingGames={loadingGames}
        gamesError={gamesError}
        promotionToEditId={promotionToEditId}
        fetchPromotions={fetchPromotions}
        closeModals={closeModals}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        setPromotionToEditId={setPromotionToEditId}
        promotions={promotions}
        promotionDetails={promotionDetails} // Pass promotionDetails
      />
      <DeletePromotionModal
        promotionToDelete={promotionToDelete}
        fetchPromotions={fetchPromotions}
        closeModals={closeModals}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        setPromotionToDelete={setPromotionToDelete}
        setFormErrors={setFormErrors}
      />
    </>
  );
};

export default PromotionModals;