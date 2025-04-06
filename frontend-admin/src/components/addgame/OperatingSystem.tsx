'use client'
import { useEffect, useState } from "react";
import OperatingSystemListItem from "../operatingsystem/OperatingSystemListItem";
import apiService from "@/services/apiService";

export type OperatingSystemType ={
    id: string;
    title: string;
    image_url: string;
}

interface OperatingSystemsProps {
    dataOperatingSystem: string[];
    setOperatingSystem: (operatingSystem: string) => void;
}



const OperatingSystems: React.FC<OperatingSystemsProps> = ({ dataOperatingSystem, setOperatingSystem }) => {
    const [operatingSystems, setOperatingSystems] = useState<OperatingSystemType[]>([]);

    const getOperatingSystem = async () => {
        const tmpOperatingSystem = await apiService.get('/api/game/operatingSystem/')
        setOperatingSystems(tmpOperatingSystem.data);
    };

    useEffect(() => {
        getOperatingSystem();
    }, []);

    return (
        <div className="pt-3 cursor-pointer pb-6 flex items-center space-x-12">
            {operatingSystems.map((operatingSystem) => {
                const isSelected = dataOperatingSystem.includes(operatingSystem.id);  // Check if category is selected

                return (
                    <OperatingSystemListItem
                        key={operatingSystem.id}
                        operatingSystem={operatingSystem}
                        onClick={() => setOperatingSystem(operatingSystem.id)}  // Toggle selection on click
                        className={`pb-4 flex flex-col items-center space-y-2 border-b-2 ${isSelected ? 'border-gray-800' : 'border-white'} opacity-60 hover:border-gray-200 hover:opacity-100`}
                    />
                );
            })}
        </div>
    );
};
export default OperatingSystems;