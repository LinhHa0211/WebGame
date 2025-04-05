'use client'
import { useEffect, useState } from "react";
import CategoryListItem from "./CategoryListItem";
import apiService from "@/services/apiService";

export type CategoryType ={
    id: string;
    title: string;
    image_url: string;
}

const CategoryList = () => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const getCategories = async () => {
        const tmpCategory = await apiService.get('/api/game/category/')
        setCategories(tmpCategory.data)
    };
    useEffect(() =>{
        getCategories()
    }, [])
    return (
        <div className="pt-3 cursor-pointer pb-6 flex items-center space-x-12">
            {categories.map((category) => {
                return (
                    <CategoryListItem
                        key={category.id}
                        category={category}
                        className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-white opacity-60 hover:border-gray-200 hover:opacity-100"
                    />
                )
            })}
        </div>
    )
}
export default CategoryList