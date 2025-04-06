'use client';

interface MenuLinkProps{
    label: string;
    className?: string;
    onClick?: () => void;
}

const MenuLink: React.FC<MenuLinkProps> = ({
    label,
    className,
    onClick,
}) => {
    return (
        <div 
            onClick={onClick}
            className={`px-5 py-4 cursor-pointer hover:bg-gray-100 transition ${className}`}
        >
            {label}
        </div>
    )
}

export default MenuLink;