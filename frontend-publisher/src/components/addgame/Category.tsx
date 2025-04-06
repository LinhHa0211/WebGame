'use client'
import { useEffect, useState } from "react";
import CategoryListItem from "../category/CategoryListItem";
import apiService from "@/services/apiService";

export type CategoryType ={
    id: string;
    title: string;
    image_url: string;
}

interface CategoriesProps {
    dataCategory: string[];
    setCategory: (category: string) => void;
}



const Categories: React.FC<CategoriesProps> = ({ dataCategory, setCategory }) => {
    const [categories, setCategories] = useState<CategoryType[]>([]);

    const getCategories = async () => {
        const tmpCategory = await apiService.get('/api/game/category/')
        setCategories(tmpCategory.data);
    };

    useEffect(() => {
        getCategories();
    }, []);

    return (
        <div className="pt-3 cursor-pointer pb-6 flex items-center space-x-12">
            {categories.map((category) => {
                const isSelected = dataCategory.includes(category.id);  // Check if category is selected

                return (
                    <CategoryListItem
                        key={category.id}
                        category={category}
                        onClick={() => setCategory(category.id)}  // Toggle selection on click
                        className={`pb-4 flex flex-col items-center space-y-2 border-b-2 ${isSelected ? 'border-gray-800' : 'border-white'} opacity-60 hover:border-gray-200 hover:opacity-100`}
                    />
                );
            })}
        </div>
    );
};
export default Categories;