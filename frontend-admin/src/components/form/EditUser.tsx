'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save } from 'lucide-react';
import apiService from '@/services/apiService';
import { toast } from 'react-toastify';

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

interface EditUserFormProps {
  user: User;
}

const EditUserForm = ({ user }: EditUserFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: user.username,
    is_active: user.is_active,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar_url || '/defaultavatar.jpg');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('is_active', String(formData.is_active));
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const response = await apiService.post(`/api/auth/users/${user.id}/update/`, formDataToSend);

      if (response.success) {
        toast.success('User updated successfully!', {
          position: 'top-right',
          autoClose: 5000,
        });
        router.push('/manage/users');
      } else {
        throw new Error(response.error || 'Failed to update user');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-[1500px] mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Edit User</h1>
          <Link href="/manage/users">
            <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300 flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">Avatar</label>
              <div className="flex items-center space-x-4">
                <Image
                  src={avatarPreview}
                  width={80}
                  height={80}
                  className="rounded-full border border-gray-300"
                  alt="User avatar"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                required
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-lg text-gray-700">Is Active</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2 ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-5 h-5" />
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditUserForm;