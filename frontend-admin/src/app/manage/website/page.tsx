'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import apiService from '@/services/apiService';
import CategoryManager from '@/components/manage/CategoryManage';
import OperatingSystemManager from '@/components/manage/OperatingSystemManage';
import PromotionManager from '@/components/manage/PromotionManage';
import OrderManager from '@/components/manage/OrderManage';

interface Game {
  id: string;
  title: string;
}

const ManageWebsite = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gamesError, setGamesError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setLoadingGames(true);
      const response = await apiService.get('/api/game/');
      setGames(response.data || []);
    } catch (err: any) {
      setGamesError(err.message || 'Failed to fetch games');
    } finally {
      setLoadingGames(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-[1500px] mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Manage Website</h1>
          <div className="flex space-x-3">
            <Link href="/manage">
              <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300 flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1500px] mx-auto px-6 py-8 space-y-6">
        <CategoryManager />
        <OperatingSystemManager />
        <PromotionManager games={games} loadingGames={loadingGames} gamesError={gamesError} />
        <OrderManager />
      </main>
    </div>
  );
};

export default ManageWebsite;