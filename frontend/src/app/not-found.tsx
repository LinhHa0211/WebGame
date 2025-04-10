import Link from "next/link";

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] sm:min-h-[calc(100vh-14rem)] bg-gray-50 text-gray-800 px-4">
            {/* 404 Icon */}
            <div className="mb-6 sm:mb-8">
                <svg
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 text-webgame"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>

            {/* 404 Message */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-3 sm:mb-4">404</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 mb-3 sm:mb-4">Page Not Found</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-6 sm:mb-8 text-center max-w-xs sm:max-w-sm md:max-w-md">
                Oops! It looks like the page you’re looking for doesn’t exist or has been moved.
            </p>

            {/* Back to Home Button */}
            <Link href="/">
                <button className="px-4 py-2 sm:px-6 sm:py-3 bg-webgame text-white text-sm sm:text-base rounded-full hover:bg-webgame-dark transition-colors duration-300">
                    Back to Home
                </button>
            </Link>
        </div>
    );
};

export default NotFoundPage;