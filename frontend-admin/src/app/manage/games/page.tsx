'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Edit, Trash2, ArrowLeft } from 'lucide-react';
import apiService from '@/services/apiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Publisher {
  id: string;
  username: string;
  avatar_url: string;
}

interface Game {
  id: string;
  title: string;
  publisher: Publisher;
  price: number;
  image_url: string;
  approval: string;
  avg_rating: number;
}

interface CategoryType {
  id: string;
  title: string;
}

interface OperatingSystemType {
  id: string;
  title: string;
}

const ManageGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [showAddGameModal, setShowAddGameModal] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<OperatingSystemType[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    publish_year: '',
    approval: 'PENDING',
    approval_description: '',
    category_ids: [] as string[],
    operating_system_ids: [] as string[],
    image: null as File | null,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]); // New state for approval filter
  const [isApprovalDropdownOpen, setIsApprovalDropdownOpen] = useState(false); // New state for dropdown toggle
  const [sortOption, setSortOption] = useState<string>('title-asc'); // New state for sorting
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/api/game/manage/');
        setGames(response.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch games');
        toast.error(err.message || 'Failed to fetch games', { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await apiService.get('/api/game/category/');
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchOperatingSystems = async () => {
      try {
        const response = await apiService.get('/api/game/operatingSystem/');
        setOperatingSystems(response.data || []);
      } catch (error) {
        console.error("Error fetching operating systems:", error);
      }
    };

    fetchGames();
    fetchCategories();
    fetchOperatingSystems();
  }, []);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsApprovalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!gameToDelete) return;

    try {
      const response = await apiService.post(`/api/game/${gameToDelete.id}/delete/`, {});
      if (response.success) {
        setGames(games.filter((game) => game.id !== gameToDelete.id));
        setShowDeleteModal(false);
        setGameToDelete(null);
        toast.success(`Game "${gameToDelete.title}" deleted successfully!`, { autoClose: 3000 });
      } else {
        setError(response.error || 'Failed to delete game');
        toast.error(response.error || 'Failed to delete game', { autoClose: 3000 });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete game');
      toast.error(err.message || 'Failed to delete game', { autoClose: 3000 });
    }
  };

  const openDeleteModal = (game: Game) => {
    setGameToDelete(game);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setGameToDelete(null);
  };

  const openAddGameModal = () => {
    setShowAddGameModal(true);
    setFormData({
      title: '',
      description: '',
      price: 0,
      publish_year: '',
      approval: 'PENDING',
      approval_description: '',
      category_ids: [],
      operating_system_ids: [],
      image: null,
    });
    setFormErrors([]);
  };

  const closeAddGameModal = () => {
    setShowAddGameModal(false);
    setFormErrors([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, field: 'category_ids' | 'operating_system_ids') => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData((prev) => ({ ...prev, [field]: selectedOptions }));
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormErrors(['Title and description are required.']);
      toast.error('Title and description are required.', { autoClose: 3000 });
      return;
    }
    if (formData.price <= 0) {
      setFormErrors(['Price must be greater than 0.']);
      toast.error('Price must be greater than 0.', { autoClose: 3000 });
      return;
    }
    if (!formData.publish_year) {
      setFormErrors(['Publish year is required.']);
      toast.error('Publish year is required.', { autoClose: 3000 });
      return;
    }

    setFormLoading(true);
    try {
      const createData = new FormData();
      createData.append('title', formData.title);
      createData.append('description', formData.description);
      createData.append('price', formData.price.toString());
      createData.append('publish_year', formData.publish_year);
      createData.append('approval', formData.approval);
      createData.append('approval_description', formData.approval_description);
      if (formData.image) {
        createData.append('image', formData.image);
      }
      formData.category_ids.forEach((id) => createData.append('category_ids[]', id));
      formData.operating_system_ids.forEach((id) => createData.append('operating_system_ids[]', id));

      const response = await apiService.post('/api/game/create/', createData);
      if (response.success) {
        setGames((prev) => [...prev, response.data]);
        closeAddGameModal();
        toast.success(`Game "${formData.title}" created successfully!`, { autoClose: 3000 });
      } else {
        setFormErrors([response.error || 'Failed to create game.']);
        toast.error(response.error || 'Failed to create game.', { autoClose: 3000 });
      }
    } catch (error: any) {
      setFormErrors([error.message || 'Failed to create game.']);
      toast.error(error.message || 'Failed to create game.', { autoClose: 3000 });
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprovalFilterChange = (approval: string) => {
    setSelectedApprovals((prev) =>
      prev.includes(approval) ? prev.filter((a) => a !== approval) : [...prev, approval]
    );
  };

  const filteredAndSortedGames = useMemo(() => {
    let filteredGames = games;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredGames = games.filter(
        (game) =>
          game.title.toLowerCase().includes(query) ||
          game.publisher.username.toLowerCase().includes(query)
      );
    }

    // Apply approval filter
    if (selectedApprovals.length > 0) {
      filteredGames = filteredGames.filter((game) => selectedApprovals.includes(game.approval));
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
      case 'publisher-asc':
        sortedGames.sort((a, b) => a.publisher.username.localeCompare(b.publisher.username));
        break;
      case 'publisher-desc':
        sortedGames.sort((a, b) => b.publisher.username.localeCompare(a.publisher.username));
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
  }, [games, searchQuery, selectedApprovals, sortOption]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-[1500px] mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Manage Games</h1>
          <div className="flex space-x-3">
            <Link href="/manage">
              <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300 flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </Link>
            <button
              onClick={openAddGameModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Add Game</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-6 py-8">
        {/* Search, Filter, and Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by title or publisher"
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
          <div ref={dropdownRef} className="relative w-full sm:w-auto">
            <button
              className="w-full sm:w-auto p-3 bg-gray-200 text-gray-800 rounded border border-gray-300 flex items-center justify-between"
              onClick={() => setIsApprovalDropdownOpen((prev) => !prev)}
            >
              <span>Approval</span>
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
            {isApprovalDropdownOpen && (
              <div className="absolute z-10 mt-2 w-full sm:w-48 bg-white border border-gray-300 rounded shadow-lg">
                <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    value="APPROVED"
                    checked={selectedApprovals.includes("APPROVED")}
                    onChange={() => handleApprovalFilterChange("APPROVED")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-800">Approved</span>
                </label>
                <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    value="PENDING"
                    checked={selectedApprovals.includes("PENDING")}
                    onChange={() => handleApprovalFilterChange("PENDING")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-800">Pending</span>
                </label>
                <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    value="REJECTED"
                    checked={selectedApprovals.includes("REJECTED")}
                    onChange={() => handleApprovalFilterChange("REJECTED")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-800">Rejected</span>
                </label>
              </div>
            )}
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
              <option value="publisher-asc">Publisher (A-Z)</option>
              <option value="publisher-desc">Publisher (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-asc">Avg Rating (Low to High)</option>
              <option value="rating-desc">Avg Rating (High to Low)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : filteredAndSortedGames.length === 0 ? (
          <p className="text-gray-600">No games found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200 text-gray-800">
                  <th className="py-3 px-4 text-left">Image</th>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Publisher</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Approval</th>
                  <th className="py-3 px-4 text-left">Avg Rating</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedGames.map((game) => (
                  <tr
                    key={game.id}
                    className={`border-b hover:bg-gray-50 ${
                      game.approval === 'PENDING'
                        ? 'bg-yellow-100'
                        : game.approval === 'REJECTED'
                        ? 'bg-red-100'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <Image
                        src={game.image_url || '/defaultgame.jpg'}
                        width={40}
                        height={40}
                        className="rounded border border-gray-300"
                        alt={`${game.title}'s image`}
                      />
                    </td>
                    <td className="py-3 px-4">{game.title}</td>
                    <td className="py-3 px-4">{game.publisher.username}</td>
                    <td className="py-3 px-4">${game.price.toFixed(2)}</td>
                    <td className="py-3 px-4">{game.approval}</td>
                    <td className="py-3 px-4">{game.avg_rating.toFixed(1)}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <Link href={`/manage/games/edit/${game.id}`}>
                        <button className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-300">
                          <Edit className="w-5 h-5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => openDeleteModal(game)}
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
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the game{' '}
              <span className="font-semibold">{gameToDelete?.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddGameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[70vh] flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Game</h2>
            <div className="flex-1 overflow-y-auto pr-2">
              <form onSubmit={handleCreateGame} className="space-y-3">
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Image
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-800"
                  />
                </div>
                <div>
                  <label htmlFor="category_ids" className="block text-sm font-medium text-gray-700">
                    Categories
                  </label>
                  <select
                    id="category_ids"
                    name="category_ids"
                    multiple
                    value={formData.category_ids}
                    onChange={(e) => handleMultiSelectChange(e, 'category_ids')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="operating_system_ids" className="block text-sm font-medium text-gray-700">
                    Operating Systems
                  </label>
                  <select
                    id="operating_system_ids"
                    name="operating_system_ids"
                    multiple
                    value={formData.operating_system_ids}
                    onChange={(e) => handleMultiSelectChange(e, 'operating_system_ids')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                  >
                    {operatingSystems.map((os) => (
                      <option key={os.id} value={os.id}>
                        {os.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="publish_year" className="block text-sm font-medium text-gray-700">
                    Publish Year
                  </label>
                  <input
                    type="date"
                    id="publish_year"
                    name="publish_year"
                    value={formData.publish_year}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="approval" className="block text-sm font-medium text-gray-700">
                    Approval
                  </label>
                  <select
                    id="approval"
                    name="approval"
                    value={formData.approval}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                  >
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="approval_description" className="block text-sm font-medium text-gray-700">
                    Approval Description
                  </label>
                  <textarea
                    id="approval_description"
                    name="approval_description"
                    value={formData.approval_description}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                    rows={3}
                  />
                </div>
                {formErrors.length > 0 && (
                  <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                    {formErrors.map((err, index) => (
                      <p key={index}>{err}</p>
                    ))}
                  </div>
                )}
              </form>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={closeAddGameModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGame}
                disabled={formLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-400"
              >
                {formLoading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  );
};

export default ManageGames;