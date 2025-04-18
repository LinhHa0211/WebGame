'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus } from 'lucide-react';
import apiService from '@/services/apiService';

interface OperatingSystem {
  id: string;
  title: string;
}

const OperatingSystemManager = () => {
  const [showOperatingSystems, setShowOperatingSystems] = useState(true);
  const [operatingSystems, setOperatingSystems] = useState<OperatingSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [osToEdit, setOsToEdit] = useState<OperatingSystem | null>(null);
  const [osToDelete, setOsToDelete] = useState<OperatingSystem | null>(null);
  const [formData, setFormData] = useState({ title: '' });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search
  const [sortOption, setSortOption] = useState<string>('title-asc'); // New state for sorting

  const fetchOperatingSystems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/game/operatingSystem/');
      setOperatingSystems(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch operating systems');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperatingSystems();
  }, [fetchOperatingSystems]);

  const openAddModal = () => {
    setShowAddModal(true);
    setFormData({ title: '' });
    setFormErrors([]);
  };

  const openEditModal = (os: OperatingSystem) => {
    setShowEditModal(true);
    setOsToEdit(os);
    setFormData({ title: os.title });
    setFormErrors([]);
  };

  const openDeleteModal = (os: OperatingSystem) => {
    setShowDeleteModal(true);
    setOsToDelete(os);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setOsToEdit(null);
    setOsToDelete(null);
    setFormErrors([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOS = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);

    try {
      const response = await apiService.post(`/api/game/operatingSystem/create/`, formDataToSend);
      if (response.success) {
        await fetchOperatingSystems();
        closeModals();
      } else {
        setFormErrors([response.error || 'Failed to create operating system']);
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Failed to create operating system']);
    }
  };

  const handleEditOS = async (e: React.FormEvent) => {
    if (!osToEdit) return;
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);

    try {
      const response = await apiService.post(`/api/game/operatingSystem/${osToEdit.id}/update/`, formDataToSend);
      if (response.success) {
        await fetchOperatingSystems();
        closeModals();
      } else {
        setFormErrors([response.error || 'Failed to update operating system']);
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Failed to update operating system']);
    }
  };

  const handleDeleteOS = async () => {
    if (!osToDelete) return;
    try {
      await apiService.post(`/api/game/operatingSystem/${osToDelete.id}/delete/`, {});
      await fetchOperatingSystems();
      closeModals();
    } catch (err: any) {
      setFormErrors([err.message || 'Failed to delete operating system']);
    }
  };

  const filteredAndSortedOperatingSystems = useMemo(() => {
    let filteredOperatingSystems = operatingSystems;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredOperatingSystems = operatingSystems.filter((os) =>
        os.title.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sortedOperatingSystems = [...filteredOperatingSystems];
    switch (sortOption) {
      case 'title-asc':
        sortedOperatingSystems.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sortedOperatingSystems.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return sortedOperatingSystems;
  }, [operatingSystems, searchQuery, sortOption]);

  return (
    <section>
      <div
        className="flex items-center justify-between bg-gray-200 p-4 rounded-t-lg cursor-pointer"
        onClick={() => setShowOperatingSystems(!showOperatingSystems)}
      >
        <h2 className="text-xl font-semibold text-gray-800">Operating Systems</h2>
        {showOperatingSystems ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </div>
      {showOperatingSystems && (
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
              </select>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Operating System</span>
          </button>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : filteredAndSortedOperatingSystems.length === 0 ? (
            <p className="text-gray-600">No operating systems found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-800">
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedOperatingSystems.map((os) => (
                    <tr key={os.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{os.title}</td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button
                          onClick={() => openEditModal(os)}
                          className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-300"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(os)}
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

      {/* Add Operating System Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Operating System</h2>
            <form onSubmit={handleAddOS} className="space-y-4">
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
                  Add Operating System
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Operating System Modal */}
      {showEditModal && osToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Operating System</h2>
            <form onSubmit={handleEditOS} className="space-y-4">
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
          </div>
        </div>
      )}

      {/* Delete Operating System Modal */}
      {showDeleteModal && osToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the operating system{' '}
              <span className="font-semibold">{osToDelete.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOS}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OperatingSystemManager;