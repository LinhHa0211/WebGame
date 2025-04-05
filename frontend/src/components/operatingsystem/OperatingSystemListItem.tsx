import Image from "next/image";
import { OperatingSystemType } from "./OperatingSystemList";
import { useEffect } from "react";

interface OperatingSystemProps{
    operatingSystem: OperatingSystemType
    onClick?: () => void
    className?: string
}

const OperatingSystemListItem: React.FC<OperatingSystemProps> = ({
    operatingSystem,
    onClick,
    className,
}) => {
    return (
        <div
            onClick={onClick}
            className={`${className} w-[50px]`}
        >
            <span className="text-xs">{operatingSystem.title}</span>
        </div>
    )
}

export default OperatingSystemListItem;