'use client';

interface InfoSidebarProps {
    publishYear: string;
    purchaseCount: number;
    avg_rating: number;
}

const InfoSidebar: React.FC<InfoSidebarProps> = ({ publishYear, purchaseCount, avg_rating }) => {
    return (
        <aside className="mt-6 p-6 col-span-2 rounded-xl border border-gray-300 shadow-xl">
            <h2 className="mb-5 text-2xl font-bold">Game Info</h2>
            <div>
                <p className="text-base text-gray-600 mb-2">
                    <span className="font-medium">Published:</span> {new Date(publishYear).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-base text-gray-600">
                    <span className="font-medium">Purchases:</span> {purchaseCount} {purchaseCount === 1 ? 'user has' : 'users have'} bought this game
                </p>
                <p className="text-base text-gray-600">
                    <span className="font-medium">Rating:</span> {avg_rating.toFixed(1)}/5
                </p>
            </div>
        </aside>
    );
};

export default InfoSidebar;