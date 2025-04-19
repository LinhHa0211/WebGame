// components/user/EditButton.tsx
'use client';

import { useState } from 'react';
import apiService from '@/services/apiService';

interface EditButtonProps {
  userId: string;
  username: string; // Change from email to username
  onUpdate: (updatedUser: { username: string; avatar_url: string }) => void; // Update callback
}

const EditButton: React.FC<EditButtonProps> = ({ userId, username, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formUsername, setFormUsername] = useState(username); // Change to username
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('username', formUsername); // Send username instead of email
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await apiService.post(`/api/auth/users/${userId}/update/`, formData);
      if (response && typeof response === 'object' && 'error' in response) {
        throw new Error(response.error);
      }

      // Assuming the response contains the updated user data
      onUpdate({
        username: response.data.username,
        avatar_url: response.data.avatar_url,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Edit Button */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="mt-4 py-2 px-4 cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Edit Profile
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Profile</h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                  Avatar
                </label>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="mt-1 p-2 w-full border rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditButton;