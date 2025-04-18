'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import apiService from "@/services/apiService";
import { GameType, CategoryType, OperatingSystemType } from "@/app/userlib/page";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { stringify } from "querystring";

interface GameProps {
    game: GameType;
    updateGame: (updatedGame: GameType | null) => void;
    categories: CategoryType[];
    operatingSystems: OperatingSystemType[];
}

const UserGameListItem: React.FC<GameProps> = ({
    game,
    updateGame,
    categories,
    operatingSystems,
}) => {
    const router = useRouter();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRejectedModal, setShowRejectedModal] = useState(false);
    const [showTakeBackModal, setShowTakeBackModal] = useState(false); // New state for Take Back modal
    const [formData, setFormData] = useState({
        title: game.title,
        description: game.description,
        price: game.price,
        publish_year: game.publish_year,
        category_ids: [] as string[],
        operating_system_ids: [] as string[],
        image: null as File | null,
    });
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch current categories and operating systems for the game
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
        if (showEditModal || showRejectedModal) {
            fetchAssociations();
        }
    }, [showEditModal, showRejectedModal, game.id]);

    const handleGoToGame = () => {
        router.push(`/game/${game.id}`);
    };

    const handleEdit = async () => {
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
            if (formData.image) {
                updateData.append('image', formData.image);
            }
            formData.category_ids.forEach((id) => updateData.append('category_ids[]', id));
            formData.operating_system_ids.forEach((id) => updateData.append('operating_system_ids[]', id));

            const response = await apiService.post(`/api/game/${game.id}/update/`, updateData);
            if (response.success) {
                updateGame({
                    ...game,
                    title: formData.title,
                    description: formData.description,
                    price: formData.price,
                    publish_year: formData.publish_year,
                    image_url: response.data.image_url,
                });
                setShowEditModal(false);
                setFormErrors([]);
                toast.success('Game updated successfully!', { autoClose: 3000 });
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

    const handleTakeBack = () => {
        setShowTakeBackModal(true); // Show modal instead of confirm
    };

    const confirmTakeBack = async () => {
        setLoading(true);
        try {
            const response = await apiService.post(`/api/game/${game.id}/delete/`, {});
            if (response.success) {
                updateGame(null); // Remove game from state
                setShowTakeBackModal(false);
                toast.success('Game deleted successfully!', { autoClose: 3000 });
            } else {
                toast.error(response.error || 'Failed to delete game.', { autoClose: 3000 });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete game.', { autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
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
            updateData.append('approval', 'PENDING');
            updateData.append('approval_description', '');
            if (formData.image) {
                updateData.append('image', formData.image);
            }
            formData.category_ids.forEach((id) => updateData.append('category_ids[]', id));
            formData.operating_system_ids.forEach((id) => updateData.append('operating_system_ids[]', id));

            const response = await apiService.post(`/api/game/${game.id}/update/`, updateData);
            if (response.success) {
                updateGame({
                    ...game,
                    title: formData.title,
                    description: formData.description,
                    price: formData.price,
                    publish_year: formData.publish_year,
                    approval: 'PENDING',
                    approval_description: '',
                    image_url: response.data.image_url,
                });
                setShowRejectedModal(false);
                setFormErrors([]);
                toast.success('Game resubmitted successfully!', { autoClose: 3000 });
            } else {
                setFormErrors([response.error || 'Failed to resubmit game.']);
                toast.error(response.error || 'Failed to resubmit game.', { autoClose: 3000 });
            }
        } catch (error: any) {
            setFormErrors([error.message || 'Failed to resubmit game.']);
            toast.error(error.message || 'Failed to resubmit game.', { autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const closeModal = () => {
        setShowEditModal(false);
        setShowRejectedModal(false);
        setShowTakeBackModal(false);
        setFormData({
            title: game.title,
            description: game.description,
            price: game.price,
            publish_year: game.publish_year,
            category_ids: [],
            operating_system_ids: [],
            image: null,
        });
        setFormErrors([]);
    };

    // Format date to a more readable format
    const formattedDate = new Date(game.publish_year).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-6 gap-4 shadow-md border border-gray-300 rounded-xl">
                <div className="col-span-1">
                    <div className="relative overflow-hidden aspect-square rounded-xl">
                        <Image
                            fill
                            src={game.image_url}
                            className="hover:scale-110 object-cover transition h-full w-full"
                            alt="Game"
                            sizes="100px"
                        />
                    </div>
                </div>
                <div className="col-span-1 sm:col-span-4">
                    <h2 className="mb-2 sm:mb-4 text-lg sm:text-xl">
                        <strong>{game.title}</strong>
                    </h2>
                    {game.approval === 'APPROVED' && (
                        <p className="mb-2 text-sm sm:text-base">
                            <strong>Publish date:</strong> {formattedDate}
                        </p>
                    )}
                    <p className="mb-2 text-sm sm:text-base">
                        <strong>Price:</strong> ${game.price}
                    </p>
                    <p className="mb-2 text-sm sm:text-base">
                        <strong>Status:</strong> {game.approval}
                    </p>
                    
                    {game.approval === 'APPROVED' && (
                        <>
                            <p className="mb-2 text-sm sm:text-base">
                                <strong>Rating:</strong> {game.avg_rating}
                            </p>
                            <p className="mb-2 text-sm sm:text-base">
                                <strong>Purchase count:</strong> {game.purchase_count}
                            </p>
                        </>
                    )}
                    {game.approval === 'REJECTED' && game.approval_description && (
                        <p className="mb-2 text-sm sm:text-base">
                            <strong>Rejection Reason:</strong> {game.approval_description}
                        </p>
                    )}
                </div>
                <div className="col-span-1 flex flex-row sm:flex-col items-center justify-center sm:space-y-2 space-x-2 sm:space-x-0">
                    <button
                        onClick={handleGoToGame}
                        className="w-[150px] inline-block cursor-pointer py-3 sm:py-4 px-5 sm:px-6 bg-webgame hover:bg-webgame-dark text-white rounded-xl text-sm sm:text-base transition-colors"
                    >
                        Go to Game
                    </button>
                    {game.approval === 'APPROVED' && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="w-[150px] inline-block cursor-pointer py-3 sm:py-4 px-5 sm:px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm sm:text-base transition-colors"
                        >
                            Edit Game
                        </button>
                    )}
                    {game.approval === 'PENDING' && (
                        <button
                            onClick={handleTakeBack}
                            className="w-[150px] inline-block cursor-pointer py-3 sm:py-4 px-5 sm:px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm sm:text-base transition-colors"
                        >
                            Take Back
                        </button>
                    )}
                    {game.approval === 'REJECTED' && (
                        <button
                            onClick={() => setShowRejectedModal(true)}
                            className="w-[150px] inline-block cursor-pointer py-3 sm:py-4 px-5 sm:px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm sm:text-base transition-colors"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />

            {/* Edit Game Modal (APPROVED) */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[70vh] flex flex-col">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Game</h2>
                        <div className="flex-1 overflow-y-auto pr-2">
                            <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-3">
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
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-400"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Rejected Game Modal (REJECTED) */}
            {showRejectedModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[70vh] flex flex-col">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Rejected Game</h2>
                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="space-y-3">
                                <p className="text-gray-600">
                                    <strong>Rejection Reason:</strong> {game.approval_description || 'No reason provided'}
                                </p>
                                <form onSubmit={(e) => { e.preventDefault(); handlePublish(); }} className="space-y-3">
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
                                    {formErrors.length > 0 && (
                                        <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                                            {formErrors.map((err, index) => (
                                                <p key={index}>{err}</p>
                                            ))}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTakeBack}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300 disabled:bg-red-400"
                            >
                                {loading ? 'Deleting...' : 'Take Back'}
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-300 disabled:bg-green-400"
                            >
                                {loading ? 'Submitting...' : 'Publish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Take Back Confirmation Modal */}
            {showTakeBackModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">{game.title}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmTakeBack}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300 disabled:bg-red-400"
                            >
                                {loading ? 'Deleting...' : 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserGameListItem;