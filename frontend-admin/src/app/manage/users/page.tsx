'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { User, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import apiService from '@/services/apiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addFormData, setAddFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    role: 'USER',
  });
  const [addError, setAddError] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('username-asc');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/auth/users/');
      setUsers(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      toast.error(err.message || 'Failed to fetch users', { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await apiService.post(`/api/auth/users/${userToDelete.id}/delete/`, {});
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      toast.success(`User "${userToDelete.username}" deleted successfully!`, { autoClose: 3000 });
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      toast.error(err.message || 'Failed to delete user', { autoClose: 3000 });
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setAddFormData({
      username: '',
      email: '',
      password1: '',
      password2: '',
      role: 'USER',
    });
    setAddError([]);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddError([]);
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      userName: addFormData.username,
      email: addFormData.email,
      password1: addFormData.password1,
      password2: addFormData.password2,
      role: addFormData.role,
    };

    try {
      const response = await apiService.postWithoutToken('/api/auth/register/', JSON.stringify(formData));
      if (response.access) {
        await fetchUsers();
        closeAddModal();
        toast.success(`User "${formData.userName}" created successfully!`, { autoClose: 3000 });
      } else {
        const tmpErrors: string[] = Object.values(response).map((error: any) => error);
        setAddError(tmpErrors);
        toast.error('Failed to create user.', { autoClose: 3000 });
      }
    } catch (err: any) {
      setAddError(['Failed to create user. Please try again.']);
      toast.error('Failed to create user.', { autoClose: 3000 });
    }
  };

  const handleRoleFilterChange = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filteredUsers = users;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredUsers = users.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (selectedRoles.length > 0) {
      filteredUsers = filteredUsers.filter((user) => selectedRoles.includes(user.role));
    }

    // Apply sorting
    const sortedUsers = [...filteredUsers];
    switch (sortOption) {
      case 'username-asc':
        sortedUsers.sort((a, b) => a.username.localeCompare(b.username));
        break;
      case 'username-desc':
        sortedUsers.sort((a, b) => b.username.localeCompare(a.username));
        break;
      case 'email-asc':
        sortedUsers.sort((a, b) => a.email.localeCompare(b.email));
        break;
      case 'email-desc':
        sortedUsers.sort((a, b) => b.email.localeCompare(a.email));
        break;
      default:
        break;
    }

    return sortedUsers;
  }, [users, searchQuery, sortOption, selectedRoles]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-[1500px] mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
          <div className="flex space-x-3">
            <Link href="/manage">
              <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300 flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </Link>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1500px] mx-auto px-6 py-8">
        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by username or email"
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
              className="w-full sm:w-auto p-2 bg-gray-200 text-gray-800 rounded border border-gray-300 flex items-center justify-between"
              onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
            >
              <span>Role</span>
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
            {isRoleDropdownOpen && (
              <div className="absolute z-10 mt-2 w-full sm:w-48 bg-white border border-gray-300 rounded shadow-lg">
                <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    value="USER"
                    checked={selectedRoles.includes("USER")}
                    onChange={() => handleRoleFilterChange("USER")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-800">User</span>
                </label>
                <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    value="PUBLISHER"
                    checked={selectedRoles.includes("PUBLISHER")}
                    onChange={() => handleRoleFilterChange("PUBLISHER")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-800">Publisher</span>
                </label>
                <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    value="ADMIN"
                    checked={selectedRoles.includes("ADMIN")}
                    onChange={() => handleRoleFilterChange("ADMIN")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-800">Admin</span>
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
              <option value="username-asc">Username (A-Z)</option>
              <option value="username-desc">Username (Z-A)</option>
              <option value="email-asc">Email (A-Z)</option>
              <option value="email-desc">Email (Z-A)</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : filteredAndSortedUsers.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200 text-gray-800">
                  <th className="py-3 px-4 text-left">Avatar</th>
                  <th className="py-3 px-4 text-left">Username</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Image
                        src={user.avatar_url || '/defaultavatar.jpg'}
                        width={40}
                        height={40}
                        className="rounded-full border border-gray-300"
                        alt={`${user.username}'s avatar`}
                      />
                    </td>
                    <td className="py-3 px-4">{user.username}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.role}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <Link href={`/manage/users/edit/${user.id}`}>
                        <button className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-300">
                          <Edit className="w-5 h-5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => openDeleteModal(user)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the user{' '}
              <span className="font-semibold">{userToDelete?.username}</span>? This action cannot be undone.
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={addFormData.username}
                  onChange={handleAddInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={addFormData.email}
                  onChange={handleAddInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                  required
                />
              </div>
              <div>
                <label htmlFor="password1" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password1"
                  name="password1"
                  value={addFormData.password1}
                  onChange={handleAddInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                  required
                />
              </div>
              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="password2"
                  name="password2"
                  value={addFormData.password2}
                  onChange={handleAddInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={addFormData.role}
                  onChange={handleAddInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                >
                  <option value="USER">User</option>
                  <option value="PUBLISHER">Publisher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {addError.length > 0 && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                  {addError.map((err, index) => (
                    <p key={index}>{err}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  );
};

export default ManageUsers;