import Image from "next/image";
import { OrderType } from "@/app/userlib/page";
import { useRouter } from "next/navigation";

interface OrderProps {
    order: OrderType
}

const UserGameListItem: React.FC<OrderProps> = ({
    order
}) => {
    const router = useRouter();

    const handleGoToGame = () => {
        // Assuming there's a game detail page route like /games/[id]
        router.push(`/game/${order.game.id}`);
    };

    // Format date to a more readable format
    const formattedDate = new Date(order.buy_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-6 gap-4 shadow-md border border-gray-300 rounded-xl">
            <div className="col-span-1">
                <div className="relative overflow-hidden aspect-square rounded-xl">
                    <Image
                        fill
                        src={order.game.image_url}
                        className="hover:scale-110 object-cover transition h-full w-full"
                        alt="Game"
                    />
                </div>
            </div>
            <div className="col-span-1 sm:col-span-4">
                <h2 className="mb-2 sm:mb-4 text-lg sm:text-xl">
                    <strong>{order.game.title}</strong>
                </h2>
                {order.status === 'PAID' && (
                    <p className="mb-2 text-sm sm:text-base">
                        <strong>Buy date:</strong> {formattedDate}
                    </p>
                )}
                <p className="mb-2 text-sm sm:text-base">
                    <strong>Price:</strong> ${order.total_price}
                </p>
                {(order.status === 'REFUNDED' || order.status === 'PROCESSING') && (
                    <p className="mb-2 text-sm sm:text-base">
                        <strong>Status:</strong> {order.status}
                    </p>
                )}
            </div>
            <div className="col-span-1">
                <button 
                    onClick={handleGoToGame}
                    className="inline-block cursor-pointer py-3 sm:py-4 px-5 sm:px-6 bg-webgame hover:bg-webgame-dark text-white rounded-xl text-sm sm:text-base transition-colors"
                >
                    Go to Game
                </button>
            </div>
        </div>
    );
};

export default UserGameListItem;