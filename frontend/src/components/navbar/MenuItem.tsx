'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Add useSearchParams
import React, { useState, useEffect } from 'react';
import apiService from "@/services/apiService";

interface Category {
    id: string;
    title: string;
}

interface OperatingSystem {
    id: string;
    title: string;
}

const MenuItem = () => {
    const router = useRouter();
    const searchParams = useSearchParams(); // Access current query parameters
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isOperatingSystemOpen, setIsOperatingSystemOpen] = useState(false);
    const [operatingSystems, setOperatingSystems] = useState<OperatingSystem[]>([]);

    const getCategories = async () => {
        const tmpCategory = await apiService.get('/api/game/category/');
        setCategories(tmpCategory.data);
    };

    const getOperatingSystems = async () => {
        const tmpOperatingSystem = await apiService.get('/api/game/operatingSystem/');
        setOperatingSystems(tmpOperatingSystem.data);
    };

    const handleCategoryToggle = () => {
        if (!isCategoryOpen && categories.length === 0) {
            getCategories();
        }
        setIsCategoryOpen(!isCategoryOpen);
        setIsOperatingSystemOpen(false);
    };

    const handleOperatingSystemToggle = () => {
        if (!isOperatingSystemOpen && operatingSystems.length === 0) {
            getOperatingSystems();
        }
        setIsOperatingSystemOpen(!isOperatingSystemOpen);
        setIsCategoryOpen(false);
    };

    const handleCategorySelect = (categoryId: string) => {
        setIsCategoryOpen(false);
        // Preserve existing 'os' query parameter if present
        const currentOs = searchParams.get('os');
        const query = new URLSearchParams();
        query.set('category', categoryId);
        if (currentOs) {
            query.set('os', currentOs);
        }
        router.push(`/search?${query.toString()}`);
    };

    const handleOperatingSystemSelect = (systemId: string) => {
        setIsOperatingSystemOpen(false);
        // Preserve existing 'category' query parameter if present
        const currentCategory = searchParams.get('category');
        const query = new URLSearchParams();
        query.set('os', systemId);
        if (currentCategory) {
            query.set('category', currentCategory);
        }
        router.push(`/search?${query.toString()}`);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.dropdown-container')) {
                setIsCategoryOpen(false);
                setIsOperatingSystemOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="h-[48px] lg:h-[64px] flex flex-row items-center justify-between">
            <div className="hidden lg:block">
                <div className="flex flex-row items-center justify-between space-x-4">
                    <div className="dropdown-container relative">
                        <div
                            onClick={handleCategoryToggle}
                            className="w-[150px] h-[48px] lg:h-[64px] items-center justify-center flex flex-row gap-2 rounded-xl hover:bg-gray-100 cursor-pointer"
                        >
                            <p className="text-lg">Category</p>
                            <svg
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className={`w-5 h-5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                        {isCategoryOpen && (
                            <div className="absolute top-[48px] lg:top-[64px] w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <div
                                            key={category.id}
                                            onClick={() => handleCategorySelect(category.id)}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {category.title}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-gray-500">Loading...</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="dropdown-container relative">
                        <div
                            onClick={handleOperatingSystemToggle}
                            className="w-[150px] h-[48px] lg:h-[64px] items-center justify-center flex flex-row gap-2 rounded-xl hover:bg-gray-100 cursor-pointer"
                        >
                            <p className="text-lg">OS</p>
                            <svg
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className={`w-5 h-5 transition-transform ${isOperatingSystemOpen ? 'rotate-180' : ''}`}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                        {isOperatingSystemOpen && (
                            <div className="absolute top-[48px] lg:top-[64px] w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                                {operatingSystems.length > 0 ? (
                                    operatingSystems.map((operatingSystem) => (
                                        <div
                                            key={operatingSystem.id}
                                            onClick={() => handleOperatingSystemSelect(operatingSystem.id)}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {operatingSystem.title}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-gray-500">Loading...</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="w-[150px] h-[48px] lg:h-[64px] items-center justify-center flex flex-row gap-2 rounded-xl hover:bg-gray-100 cursor-pointer">
                        <Link href={'/about'} className="text-lg">About</Link>
                    </div>
                    <div className="w-[150px] h-[48px] lg:h-[64px] items-center justify-center flex flex-row gap-2 rounded-xl hover:bg-gray-100 cursor-pointer">
                        <Link href={'/contact'} className="text-lg">Contact</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuItem;