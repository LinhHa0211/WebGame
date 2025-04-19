'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import GameListItem from './GameListItem';
import apiService from '@/services/apiService';
import { getUserId } from '@/lib/actions';

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

interface PromotionDetails {
  discount: number;
  promotion_end: string;
}

export type GameType = {
  id: string;
  title: string;
  price: number;
  image_url: string;
  publisher: Publisher;
  avg_rating: number;
  promotion_details?: PromotionDetails;
  category_ids?: string[];
  operating_system_ids?: string[];
};

export type OrderType = {
  id: string;
  game: GameType;
  status: string;
  buy_at?: string;
  total_price?: number;
};

interface PublisherGameListProps {
  publisher_id?: string | null;
}

const PublisherGameList: React.FC<PublisherGameListProps> = ({ publisher_id }) => {
  const [games, setGames] = useState<GameType[]>([]);
  const [favoritedGameIds, setFavoritedGameIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<OperatingSystem[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('title-asc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOperatingSystems, setSelectedOperatingSystems] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 16;

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const getGames = async () => {
    let url = '/api/game/search/';
    if (publisher_id) {
      url += `?publisher_id=${publisher_id}`;
    }
    const tmpGame = await apiService.get(url);
    console.log('Games API Response (Homepage):', tmpGame.data);
    // Log specifically for promotion_details
    tmpGame.data.forEach((game: GameType) => {
      console.log(`Game ${game.title} has promotion_details:`, game.promotion_details || 'Not present');
    });
    setGames(tmpGame.data || []);
  };

  const getWishlist = async () => {
    if (!userId) return;
    try {
      const response = await apiService.get(`/api/game/${userId}/order/`);
      console.log('Wishlist response:', response);
      const orders: OrderType[] = response.data || [];
      const wishlistGameIds = orders
        .filter((order: OrderType) => order.status === 'WL')
        .map((order: OrderType) => order.game.id);
      setFavoritedGameIds(new Set(wishlistGameIds));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/api/game/category/');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchOperatingSystems = async () => {
    try {
      const response = await apiService.get('/api/game/operatingSystem/');
      setOperatingSystems(response.data || []);
    } catch (error) {
      console.error('Error fetching operating systems:', error);
      setOperatingSystems([]);
    }
  };

  const fetchPublishers = (gamesData: GameType[]) => {
    const publisherSet = new Map<string, Publisher>();
    gamesData.forEach((game) => {
      if (!publisherSet.has(game.publisher.id)) {
        publisherSet.set(game.publisher.id, game.publisher);
      }
    });
    setPublishers(Array.from(publisherSet.values()));
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getGames(), fetchCategories(), fetchOperatingSystems()]);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (games.length > 0) {
      fetchPublishers(games);
    }
  }, [games]);

  useEffect(() => {
    if (userId) {
      getWishlist();
    }
  }, [userId]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedOperatingSystems, minPrice, maxPrice, sortOption]);

  const filteredAndSortedGames = useMemo(() => {
    let filteredGames = games;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredGames = filteredGames.filter((game) =>
        game.title.toLowerCase().includes(query)
      );
    }

    // Apply category filter: Game must match ALL selected categories
    if (selectedCategories.length > 0) {
      filteredGames = filteredGames.filter((game) => {
        const gameCategories = game.category_ids || [];
        if (!gameCategories || gameCategories.length === 0) {
          return false;
        }
        return selectedCategories.every((categoryId) => gameCategories.includes(categoryId));
      });
    }

    // Apply operating system filter: Game must match ALL selected operating systems
    if (selectedOperatingSystems.length > 0) {
      filteredGames = filteredGames.filter((game) => {
        const gameOperatingSystems = game.operating_system_ids || [];
        if (!gameOperatingSystems || gameOperatingSystems.length === 0) {
          return false;
        }
        return selectedOperatingSystems.every((systemId) => gameOperatingSystems.includes(systemId));
      });
    }

    // Apply price range filter
    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;
    if (min !== null) {
      filteredGames = filteredGames.filter((game) => game.price >= min);
    }
    if (max !== null) {
      filteredGames = filteredGames.filter((game) => game.price <= max);
    }

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

    return sortedGames;
  }, [
    games,
    searchQuery,
    selectedCategories,
    selectedOperatingSystems,
    minPrice,
    maxPrice,
    sortOption,
  ]);

  // Pagination Logic
  const totalGames = filteredAndSortedGames.length;
  const totalPages = Math.ceil(totalGames / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredAndSortedGames.slice(startIndex, endIndex);

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

  const handleToggleFavorite = (gameId: string, isFavorited: boolean) => {
    if (isFavorited) {
      setFavoritedGameIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(gameId);
        return newSet;
      });
    } else {
      setFavoritedGameIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(gameId);
        return newSet;
      });
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Explore Games
          </h1>
          <p className="mt-2 text-base sm:text-lg opacity-90">
            Discover your next favorite game!
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 mt-8">
        {/* Filter Bar (Sidebar on Desktop, Collapsible on Mobile) */}
        <div className="lg:w-64 flex-shrink-0">
          {/* Filter Toggle Button for Mobile */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg flex items-center justify-between"
            >
              <span>Filters</span>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Filter Bar Content */}
          <div
            className={`lg:block ${isFilterOpen ? 'block' : 'hidden'} bg-white p-4 rounded-lg shadow-md lg:shadow-none lg:p-0 lg:bg-transparent`}
          >
            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Categories</h3>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-sm">No categories available</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => {
                          setSelectedCategories((prev) =>
                            prev.includes(category.id)
                              ? prev.filter((id) => id !== category.id)
                              : [...prev, category.id]
                          );
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{category.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Operating Systems Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Operating Systems</h3>
              {operatingSystems.length === 0 ? (
                <p className="text-gray-500 text-sm">No operating systems available</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {operatingSystems.map((system) => (
                    <label key={system.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedOperatingSystems.includes(system.id)}
                        onChange={() => {
                          setSelectedOperatingSystems((prev) =>
                            prev.includes(system.id)
                              ? prev.filter((id) => id !== system.id)
                              : [...prev, system.id]
                          );
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{system.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Price Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  min="0"
                />
                <span className="text-gray-700">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search games by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-asc">Rating (Low to High)</option>
              <option value="rating-desc">Rating (High to Low)</option>
            </select>
          </div>

          {/* Game List */}
          {filteredAndSortedGames.length === 0 ? (
            <p className="text-gray-600 text-center">No games found. Try adjusting your search or filters.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {currentGames.map((game) => (
                  <GameListItem
                    key={game.id}
                    game={game}
                    isFavorited={favoritedGameIds.has(game.id)}
                    onToggleFavorite={handleToggleFavorite}
                    userId={userId}
                  />
                ))}
              </div>

              {/* Pagination Controls - Show only if more than 1 page */}
              {totalPages > 1 && (
                <div className="w-full flex flex-wrap justify-center items-center mt-8 p-4 space-x-2">
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
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublisherGameList;