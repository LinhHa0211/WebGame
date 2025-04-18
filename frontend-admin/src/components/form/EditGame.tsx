'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/services/apiService';
import { toast } from 'react-toastify';

interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  publish_year: string;
  approval: string;
  approval_description?: string;
}

interface CategoryType {
  id: string;
  title: string;
}

interface OperatingSystemType {
  id: string;
  title: string;
}

interface EditGameFormProps {
  game: Game;
}

const EditGameForm = ({ game }: EditGameFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: game.title,
    description: game.description,
    price: game.price,
    publish_year: game.publish_year,
    approval: game.approval,
    approval_description: game.approval_description || '',
    category_ids: [] as string[],
    operating_system_ids: [] as string[],
    image: null as File | null,
  });
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<OperatingSystemType[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const categoryResponse = await apiService.get(`/api/game/category/${game.id}/`);
        const osResponse = await apiService.get(`/api/game/operatingSystem/${game.id}/`);
        setFormData((prev) => ({
          ...prev,
          category_ids: categoryResponse.data.map((cat: CategoryType) => cat.id),
          operating_system_ids: osResponse.data.map((os: OperatingSystemType) => os.id),
        }));
      } catch (error) {
        console.error("Error fetching associations:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await apiService.get('/api/game/category/');
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchOperatingSystems = async () => {
      try {
        const response = await apiService.get('/api/game/operatingSystem/');
        setOperatingSystems(response.data);
      } catch (error) {
        console.error("Error fetching operating systems:", error);
      }
    };

    fetchAssociations();
    fetchCategories();
    fetchOperatingSystems();
  }, [game.id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);
    try {
      const updateData = new FormData();
      updateData.append('title', formData.title);
      updateData.append('description', formData.description);
      updateData.append('price', formData.price.toString());
      updateData.append('publish_year', formData.publish_year);
      updateData.append('approval', formData.approval);
      updateData.append('approval_description', formData.approval_description);
      if (formData.image) {
        updateData.append('image', formData.image);
      }
      formData.category_ids.forEach((id) => updateData.append('category_ids[]', id));
      formData.operating_system_ids.forEach((id) => updateData.append('operating_system_ids[]', id));

      const response = await apiService.post(`/api/game/${game.id}/update/`, updateData);
      if (response.success) {
        toast.success('Game updated successfully!', { autoClose: 3000 });
        router.push('/manage/games');
      } else {
        setFormErrors([response.error || 'Failed to update game.']);
        toast.error(response.error || 'Failed to update game.', { autoClose: 3000 });
      }
    } catch (error: any) {
      setFormErrors([error.message || 'Failed to update game.']);
      toast.error(error.message || 'Failed to update game.', { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-[1500px] mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Game</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto space-y-4">
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
              rows={4}
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
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/manage/games')}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-400"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGameForm;