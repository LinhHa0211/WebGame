import Link from "next/link";

const AboutPage = () => {
    return (
        <div className="min-h-[calc(100vh-16rem)] sm:min-h-[calc(100vh-14rem)] bg-gray-50 py-10 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="text-center mb-10 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">About WebGame</h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
                        Discover the story behind WebGame, a platform dedicated to bringing gamers together for fun, connection, and competition.
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-16">
                    {/* Introduction Section */}
                    <section className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-4">Who We Are</h2>
                        <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                            WebGame is a vibrant online platform created to connect gamers from around the world. Whether you’re a casual player or a competitive enthusiast, we provide a space to discover, play, and share your favorite games. Our platform was born out of a passion for gaming and a desire to build a community where everyone feels welcome.
                        </p>
                    </section>

                    {/* Mission Statement Section */}
                    <section className="bg-gray-800 text-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4">Our Mission</h2>
                        <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                            At WebGame, our mission is to create a seamless and enjoyable gaming experience for all. We aim to foster a community where players can connect, compete, and celebrate their love for games. By providing a user-friendly platform with a diverse library of games, we strive to make gaming accessible and fun for everyone.
                        </p>
                    </section>

                    {/* Creator Section */}
                    <section className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-4">Meet the Creator</h2>
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
                                <span className="text-2xl sm:text-3xl font-semibold text-gray-600">HNL</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">Ha Ngoc Linh B2207536</h3>
                            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
                                Hi, I’m Ha Ngoc Linh, the creator of WebGame. As a passionate gamer and developer, I wanted to build a platform that brings people together through the joy of gaming. I hope you enjoy exploring WebGame as much as I enjoyed creating it!
                            </p>
                            <Link href="/contact">
                                <button className="px-6 py-3 bg-red-600 text-white text-sm sm:text-base rounded-full hover:bg-red-700 transition-colors duration-300">
                                    Get in Touch
                                </button>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;