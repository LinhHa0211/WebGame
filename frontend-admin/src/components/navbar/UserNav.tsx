'use client';
import { useState, useEffect } from "react";
import MenuLink from "./MenuLink";
import useLoginModal from "@/hooks/useLoginModal";
import useSignupModal from "@/hooks/useSignupModal";
import LogoutButton from "../button/LogoutButton";
import apiService from "@/services/apiService";

interface UserNavProps {
    userId?: string | null;
}

interface Category {
    id: string;
    title: string;
}

interface OperatingSystem {
    id: string;
    title: string;
}

const UserNav: React.FC<UserNavProps> = ({ userId }) => {
    const loginModal = useLoginModal();
    const signupModal = useSignupModal();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isOperatingSystemOpen, setIsOperatingSystemOpen] = useState(false);
    const [operatingSystems, setOperatingSystems] = useState<OperatingSystem[]>([]);

    const getCategories = async () => {
        const tmpCategory = await apiService.get('/api/game/category/');
        setCategories(tmpCategory.data);
    };

    const getOperatingSystems = async () => {
        const tmpOS = await apiService.get('/api/game/operatingSystem/');
        setOperatingSystems(tmpOS.data);
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.dropdown-container') && !target.closest('.menu-button')) {
                setIsCategoryOpen(false);
                setIsOperatingSystemOpen(false);
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="p-2 relative inline-flex items-center gap-2 border rounded-full">
            {/* Menu Icon for Mobile */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 menu-button"
            >
                <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                </svg>
            </button>

            {/* Profile Icon for Desktop */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:block p-2 rounded-full hover:bg-gray-100 menu-button"
            >
                <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Overlay for mobile view */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    {/* Sidebar for mobile view */}
                    <div
                        className={`
                            fixed top-0 right-0 h-full w-[250px] bg-white border-r shadow-md flex flex-col cursor-pointer
                            transform transition-transform duration-300 ease-in-out
                            ${isOpen ? "translate-x-0" : "-translate-x-full"}
                            lg:hidden z-50
                        `}
                    >
                        <div className="flex justify-end p-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <svg
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="relative dropdown-container">
                            {userId ? (
                                <>
                                    <LogoutButton />
                                    <hr />
                                    <MenuLink
                                        label="Manage"
                                        onClick={() => {
                                            window.location.href = '/manage'
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <MenuLink
                                        label="Log in"
                                        onClick={() => {
                                            setIsOpen(false);
                                            loginModal.open();
                                        }}
                                    />
                                    <MenuLink
                                        label="Sign up"
                                        onClick={() => {
                                            setIsOpen(false);
                                            signupModal.open();
                                        }}
                                    />
                                </>
                            )}
                        </div>
                        <hr />

                        {/* Category Dropdown */}
                        <div className="dropdown-container relative">
                            <MenuLink
                                label="Category"
                                onClick={handleCategoryToggle}
                            />
                            {isCategoryOpen && (
                                <div className="pl-4">
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <MenuLink
                                                key={category.id}
                                                label={category.title}
                                                onClick={() => setIsOpen(false)}
                                                className="underline"
                                            />
                                        ))
                                    ) : (
                                        <MenuLink
                                            label="Loading..."
                                            className="text-gray-500"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* OS Dropdown */}
                        <div className="dropdown-container relative">
                            <MenuLink
                                label="OS"
                                onClick={handleOperatingSystemToggle}
                            />
                            {isOperatingSystemOpen && (
                                <div className="pl-4">
                                    {operatingSystems.length > 0 ? (
                                        operatingSystems.map((os) => (
                                            <MenuLink
                                                key={os.id}
                                                label={os.title}
                                                onClick={() => setIsOpen(false)}
                                                className="underline"
                                            />
                                        ))
                                    ) : (
                                        <MenuLink
                                            label="Loading..."
                                            className="text-gray-500"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <MenuLink
                            label="About"
                            onClick={() => setIsOpen(false)}
                        />
                        <MenuLink
                            label="Contact"
                            onClick={() => setIsOpen(false)}
                        />
                    </div>

                    {/* Desktop Dropdown */}
                    <div className="hidden lg:block w-[220px] absolute top-[60px] right-0 bg-white border rounded-xl shadow-md flex flex-col cursor-pointer dropdown-container">
                        {userId ? (
                            <>
                                <LogoutButton />
                                <hr />
                                <MenuLink
                                    label="Manage"
                                    onClick={() => {
                                        window.location.href = '/manage'
                                    }}
                                />
                            </>
                        ) : (
                            <>
                                <MenuLink
                                    label="Log in"
                                    onClick={() => {
                                        setIsOpen(false);
                                        loginModal.open();
                                    }}
                                />
                                <MenuLink
                                    label="Sign up"
                                    onClick={() => {
                                        setIsOpen(false);
                                        signupModal.open();
                                    }}
                                />
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default UserNav;