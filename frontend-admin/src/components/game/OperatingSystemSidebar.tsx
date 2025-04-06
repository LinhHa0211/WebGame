'use client'

import { useState, useEffect } from 'react';
import apiService from "@/services/apiService";

interface OperatingSystemSidebarProps {
    id: string;
}

export type OperatingSystemType = {
    id: string;
    title: string;
}

const OperatingSystemSidebar: React.FC<OperatingSystemSidebarProps> = ({ id }) => {
    const [operatingSystems, setOperatingSystems] = useState<OperatingSystemType[]>([]);

    const getOperatingSystems = async () => {
        try {
            const response = await apiService.get(`/api/game/operatingSystem/${id}`);
            // Assuming the API returns an array of categories or a single category in 'data'
            const operatingSystemData = Array.isArray(response.data) ? response.data : [response.data];
            setOperatingSystems(operatingSystemData.filter(Boolean)); // Filter out null/undefined values
        } catch (error) {
            console.error('Error fetching Operating Systems:', error);
            setOperatingSystems([]);
        }
    };

    useEffect(() => {
        getOperatingSystems();
    }, [id]); // Added 'id' as dependency to refetch if it changes

    return (
        <aside className="mt-6 p-6 col-span-2 rounded-xl border border-gray-300 shadow-xl">
            <h2 className="mb-5 text-2xl font-bold">Category</h2>
            {operatingSystems.length > 0 ? (
                operatingSystems.map((operatingSystem) => (
                    <div key={operatingSystem.id} className="mb-2">
                        <p className='text-lg underline hover:text-gray-300 transition-colors duration-200 cursor-pointer'>{operatingSystem.title}</p>
                    </div>
                ))
            ) : (
                <p>No Operating Systems available</p>
            )}
        </aside>
    );
};

export default OperatingSystemSidebar;