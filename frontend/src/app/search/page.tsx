'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import apiService from '@/services/apiService';
import SearchControls from '@/components/search/SearchControl';
import GameCard from '@/components/search/GameCard';
import FilterBar from '@/components/search/FilterBar';

interface Publisher {
  id: string;
  username: string;
}

interface Category {
  id: string;
  title: string;
}

interface OperatingSystem {
  id: string;
  title: string;
}

interface Game {
  id: string;
  title: string;
  publisher: Publisher;
  price: number;
  approval: string;
  avg_rating: number;
  image_url: string;
  category_ids?: string[];
  operating_system_ids?: string[];
}

const GameSearchPage = () => {
  const searchParams = useSearchParams();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<OperatingSystem[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('title-asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize selectedCategories and selectedOperatingSystems with query parameters (if any)
  const initialCategory = searchParams.get('category');
  const initialOperatingSystem = searchParams.get('os');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedOperatingSystems, setSelectedOperatingSystems] = useState<string[]>(
    initialOperatingSystem ? [initialOperatingSystem] : []
  );
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const gamesPerPage = 16;

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/game/search/');
      console.log('Games API Response:', response.data);
      setGames(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch games');
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiService.get('/api/game/category/');
      console.log('Categories API Response:', response.data);
      setCategories(response.data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  }, []);

  const fetchOperatingSystems = useCallback(async () => {
    try {
      const response = await apiService.get('/api/game/operatingSystem/');
      console.log('Operating Systems API Response:', response.data);
      setOperatingSystems(response.data || []);
    } catch (err: any) {
      console.error('Error fetching operating systems:', err);
      setOperatingSystems([]);
    }
  }, []);

  const fetchPublishers = useCallback((gamesData: Game[]) => {
    const publisherSet = new Map<string, Publisher>();
    gamesData.forEach((game) => {
      if (!publisherSet.has(game.publisher.id)) {
        publisherSet.set(game.publisher.id, game.publisher);
      }
    });
    setPublishers(Array.from(publisherSet.values()));
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([fetchGames(), fetchCategories(), fetchOperatingSystems()]);
      setLoading(false);
    };
    fetchAllData();
  }, [fetchGames, fetchCategories, fetchOperatingSystems]);

  useEffect(() => {
    if (games.length > 0) {
      fetchPublishers(games);
    }
  }, [games, fetchPublishers]);

  // Debug selected filters
  useEffect(() => {
    console.log('Selected Categories:', selectedCategories);
    console.log('Selected Operating Systems:', selectedOperatingSystems);
  }, [selectedCategories, selectedOperatingSystems]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedOperatingSystems, selectedPublishers, minPrice, maxPrice, sortOption]);

  const filteredAndSortedGames = useMemo(() => {
    console.log('Recomputing filteredAndSortedGames');
    console.log('Games before filtering:', games.map(game => game.title));
    let filteredGames = games;

    filteredGames = filteredGames.filter((game) => {
      // Always apply the approval filter
      if (game.approval !== 'APPROVED') {
        console.log(`Game ${game.title} filtered out due to approval:`, game.approval);
        return false;
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!game.title.toLowerCase().includes(query)) {
          console.log(`Game ${game.title} filtered out due to search query:`, query);
          return false;
        }
      }

      // Apply category filter: Game must match ALL selected categories
      if (selectedCategories.length > 0) {
        const gameCategories = game.category_ids || [];
        if (!gameCategories || gameCategories.length === 0) {
          console.log(`Game ${game.title} filtered out: no categories`);
          return false;
        }
        const matchesAllCategories = selectedCategories.every((categoryId) => gameCategories.includes(categoryId));
        console.log(`Game ${game.title} categories:`, gameCategories);
        console.log('Checking against selected categories:', selectedCategories);
        console.log(`Matches all categories for ${game.title}:`, matchesAllCategories);
        if (!matchesAllCategories) {
          return false;
        }
      }

      // Apply operating system filter: Game must match ALL selected operating systems
      if (selectedOperatingSystems.length > 0) {
        const gameOperatingSystems = game.operating_system_ids || [];
        if (!gameOperatingSystems || gameOperatingSystems.length === 0) {
          console.log(`Game ${game.title} filtered out: no operating systems`);
          return false;
        }
        const matchesAllOperatingSystems = selectedOperatingSystems.every((systemId) => gameOperatingSystems.includes(systemId));
        console.log(`Game ${game.title} operating systems:`, gameOperatingSystems);
        console.log('Checking against selected operating systems:', selectedOperatingSystems);
        console.log(`Matches all operating systems for ${game.title}:`, matchesAllOperatingSystems);
        if (!matchesAllOperatingSystems) {
          return false;
        }
      }

      // Apply publisher filter: Game must match ALL selected publishers
      if (selectedPublishers.length > 0) {
        if (!selectedPublishers.includes(game.publisher.id)) {
          console.log(`Game ${game.title} filtered out: publisher ${game.publisher.id} not in`, selectedPublishers);
          return false;
        }
      }

      // Apply price range filter
      const min = minPrice ? parseFloat(minPrice) : null;
      const max = maxPrice ? parseFloat(maxPrice) : null;
      if (min !== null && game.price < min) {
        console.log(`Game ${game.title} filtered out: price ${game.price} < min ${min}`);
        return false;
      }
      if (max !== null && game.price > max) {
        console.log(`Game ${game.title} filtered out: price ${game.price} > max ${max}`);
        return false;
      }

      return true; // Game passes all filters
    });

    // Apply sorting
    const sortedGames = [...filteredGames];
    switch (sortOption) {
      case 'title-asc':
        sortedGames.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sortedGames.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'price-asc':
        sortedGames.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedGames.sort((a, b) => b.price - a.price);
        break;
      case 'rating-asc':
        sortedGames.sort((a, b) => a.avg_rating - b.avg_rating);
        break;
      case 'rating-desc':
        sortedGames.sort((a, b) => b.avg_rating - a.avg_rating);
        break;
      default:
        break;
    }

    console.log('Filtered and Sorted Games:', sortedGames.map(game => game.title));
    return sortedGames;
  }, [
    games,
    searchQuery,
    selectedCategories,
    selectedOperatingSystems,
    selectedPublishers,
    minPrice,
    maxPrice,
    sortOption,
  ]);

  // Calculate pagination details
  const totalGames = filteredAndSortedGames.length;
  const totalPages = Math.ceil(totalGames / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredAndSortedGames.slice(startIndex, endIndex);
  console.log('Current Games:', currentGames.map(game => game.title));

  // Handle page changes
  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Gradient */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Find Your Next Game</h1>
          <p className="mt-2 text-lg opacity-90">Explore a wide range of games tailored just for you!</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
        {/* Filter Bar */}
        <div className="lg:w-64 flex-shrink-0">
          {loading ? (
            <p className="text-gray-600">Loading filters...</p>
          ) : (
            <FilterBar
              categories={categories}
              operatingSystems={operatingSystems}
              publishers={publishers}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedOperatingSystems={selectedOperatingSystems}
              setSelectedOperatingSystems={setSelectedOperatingSystems}
              selectedPublishers={selectedPublishers}
              setSelectedPublishers={setSelectedPublishers}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
            />
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Search and Sort Controls */}
          <SearchControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />

          {/* Game Cards Grid */}
          {loading ? (
            <p className="text-gray-600 text-center">Loading...</p>
          ) : error ? (
            <p className="text-red-600 text-center">{error}</p>
          ) : filteredAndSortedGames.length === 0 ? (
            <p className="text-gray-600 text-center">No games found. Try adjusting your search or filters.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="w-full flex justify-center items-center mt-8 p-4 space-x-2">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className={`w-24 px-3 py-2 rounded-lg text-white font-semibold transition-colors duration-200 ${
                    currentPage === 1
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  First
                </button>
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`w-24 px-3 py-2 rounded-lg text-white font-semibold transition-colors duration-200 ${
                    currentPage === 1
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`w-24 px-3 py-2 rounded-lg text-white font-semibold transition-colors duration-200 ${
                    currentPage === totalPages
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className={`w-24 px-3 py-2 rounded-lg text-white font-semibold transition-colors duration-200 ${
                    currentPage === totalPages
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Last
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default GameSearchPage;