'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus } from 'lucide-react';
import apiService from '@/services/apiService';

interface Category {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

const CategoryManager = () => {
  const [showCategories, setShowCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', image: null as File | null });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search
  const [sortOption, setSortOption] = useState<string>('title-asc'); // New state for sorting

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/game/category/');
      setCategories(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAddModal = () => {
    setShowAddModal(true);
    setFormData({ title: '', description: '', image: null });
    setFormErrors([]);
  };

  const openEditModal = (category: Category) => {
    setShowEditModal(true);
    setCategoryToEdit(category);
    setFormData({
      title: category.title,
      description: category.description,
      image: null,
    });
    setFormErrors([]);
  };

  const openDeleteModal = (category: Category) => {
    setShowDeleteModal(true);
    setCategoryToDelete(category);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setCategoryToEdit(null);
    setCategoryToDelete(null);
    setFormErrors([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await apiService.post(`/api/game/category/create/`, formDataToSend);
      if (response.success) {
        await fetchCategories();
        closeModals();
      } else {
        setFormErrors([response.error || 'Failed to create category']);
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Failed to create category']);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    if (!categoryToEdit) return;
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await apiService.post(`/api/game/category/${categoryToEdit.id}/update/`, formDataToSend);
      if (response.success) {
        await fetchCategories();
        closeModals();
      } else {
        setFormErrors([response.error || 'Failed to update category']);
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Failed to update category']);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await apiService.post(`/api/game/category/${categoryToDelete.id}/delete/`, {});
      await fetchCategories();
      closeModals();
    } catch (err: any) {
      setFormErrors([err.message || 'Failed to delete category']);
    }
  };

  const filteredAndSortedCategories = useMemo(() => {
    let filteredCategories = categories;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredCategories = categories.filter((category) =>
        category.title.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sortedCategories = [...filteredCategories];
    switch (sortOption) {
      case 'title-asc':
        sortedCategories.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sortedCategories.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return sortedCategories;
  }, [categories, searchQuery, sortOption]);

  return (
    <section>
      <div
        className="flex items-center justify-between bg-gray-200 p-4 rounded-t-lg cursor-pointer"
        onClick={() => setShowCategories(!showCategories)}
      >
        <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
        {showCategories ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </div>
      {showCategories && (
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
            <span>Add Category</span>
          </button>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : filteredAndSortedCategories.length === 0 ? (
            <p className="text-gray-600">No categories found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-800">
                    <th className="py-3 px-4 text-left">Image</th>
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedCategories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {category.image_url ? (
                          <Image
                            src={category.image_url}
                            width={40}
                            height={40}
                            className="rounded border border-gray-300"
                            alt={`${category.title} image`}
                          />
                        ) : (
                          'No Image'
                        )}
                      </td>
                      <td className="py-3 px-4">{category.title}</td>
                      <td className="py-3 px-4">{category.description}</td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-300"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
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

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
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
                  Image (optional)
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && categoryToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Category</h2>
            <form onSubmit={handleEditCategory} className="space-y-4">
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
                  Image (optional)
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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

      {/* Delete Category Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the category{' '}
              <span className="font-semibold">{categoryToDelete.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
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

export default CategoryManager;