'use client'
import { useEffect, useState } from "react";
import OperatingSystemListItem from "./OperatingSystemListItem";
import apiService from "@/services/apiService";

export type OperatingSystemType ={
    id: string;
    title: string;
    image_url: string;
}

const OperatingSystemList = () => {
    const [operatingSystems, setOperatingSystems] = useState<OperatingSystemType[]>([]);
    useEffect(() =>{
        const getOperatingSystems = async () => {
            const tmpOperatingSystem = await apiService.get('/api/game/operatingSystem/')
            setOperatingSystems(tmpOperatingSystem.data)
        };
        getOperatingSystems()
    }, [])
    return (
        <div className="pt-3 cursor-pointer pb-6 flex items-center space-x-12 rounded-full">
            {operatingSystems.map((operatingSystem) => {
                return (
                    <OperatingSystemListItem
                        key={operatingSystem.id}
                        operatingSystem={operatingSystem}
                        className="pb-4 flex flex-col items-center space-y-2 border-b-2 border-white opacity-60 hover:border-gray-200 hover:opacity-100"
                    />
                )
            })}
        </div>
    )
}
export default OperatingSystemList