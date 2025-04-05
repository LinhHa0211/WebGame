'use client'

import { useState, useEffect } from 'react';
import apiService from "@/services/apiService";

interface CategorySidebarProps {
    id: string;
}

export type CategoryType = {
    id: string;
    title: string;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ id }) => {
    const [categories, setCategories] = useState<CategoryType[]>([]);

    const getCategories = async () => {
        try {
            const response = await apiService.get(`/api/game/category/${id}`);
            // Assuming the API returns an array of categories or a single category in 'data'
            const categoryData = Array.isArray(response.data) ? response.data : [response.data];
            setCategories(categoryData.filter(Boolean)); // Filter out null/undefined values
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    useEffect(() => {
        getCategories();
    }, [id]); // Added 'id' as dependency to refetch if it changes

    return (
        <aside className="mt-6 p-6 col-span-2 rounded-xl border border-gray-300 shadow-xl">
            <h2 className="mb-5 text-2xl font-bold">Category</h2>
            {categories.length > 0 ? (
                categories.map((category) => (
                    <div key={category.id} className="mb-2">
                        <p className='text-lg underline hover:text-gray-300 transition-colors duration-200 cursor-pointer'>{category.title}</p>
                    </div>
                ))
            ) : (
                <p>No categories available</p>
            )}
        </aside>
    );
};

export default CategorySidebar;