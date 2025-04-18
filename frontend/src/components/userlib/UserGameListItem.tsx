'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import apiService from "@/services/apiService";
import { OrderType } from "@/app/userlib/page";

interface OrderProps {
    order: OrderType;
    updateOrder: (updatedOrder: OrderType) => void;
}

const UserGameListItem: React.FC<OrderProps> = ({
    order,
    updateOrder,
}) => {
    const router = useRouter();
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundDescription, setRefundDescription] = useState("");
    const [refundError, setRefundError] = useState<string | null>(null);

    const handleGoToGame = () => {
        router.push(`/game/${order.game.id}`);
    };

    const handleRefund = async () => {
        if (!refundDescription.trim()) {
            setRefundError("Please provide a reason for the refund.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("status", "PROCESSING");
            formData.append("refund_description", refundDescription);

            const response = await apiService.post(`/api/game/orders/${order.id}/update/`, formData);
            if (response.success) {
                updateOrder({
                    ...order,
                    status: "PROCESSING",
                    refund_description: refundDescription,
                });
                setShowRefundModal(false);
                setRefundDescription("");
                setRefundError(null);
            } else {
                setRefundError(response.error || "Failed to request refund.");
            }
        } catch (error: any) {
            setRefundError(error.message || "Failed to request refund.");
        }
    };

    const handleTakeBack = async () => {
        try {
            const formData = new FormData();
            formData.append("status", "PAID");
            formData.append("refund_description", "");

            const response = await apiService.post(`/api/game/orders/${order.id}/update/`, formData);
            if (response.success) {
                updateOrder({
                    ...order,
                    status: "PAID",
                    refund_description: "",
                });
            } else {
                alert(response.error || "Failed to take back refund request.");
            }
        } catch (error: any) {
            alert(error.message || "Failed to take back refund request.");
        }
    };

    const handleCloseModal = () => {
        setShowRefundModal(false);
        setRefundDescription("");
        setRefundError(null);
    };

    // Format date to a more readable format
    const formattedDate = new Date(order.buy_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-6 gap-4 shadow-md border border-gray-300 rounded-xl">
                <div className="col-span-1">
                    <div className="relative overflow-hidden aspect-square rounded-xl">
                        <Image
                            fill
                            src={order.game.image_url}
                            className="hover:scale-110 object-cover transition h-full w-full"
                            alt="Game"
                            sizes="100px" // Add sizes prop to address warning
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
                    {(order.status === 'REFUNDED' || order.status === 'PROCESSING' || order.status === 'REJECTED') && (
                        <p className="mb-2 text-sm sm:text-base">
                            <strong>Status:</strong> {order.status}
                        </p>
                    )}
                    {(order.status === 'PROCESSING') && order.refund_description && (
                        <p className="mb-2 text-sm sm:text-base">
                            <strong>Refund Reason:</strong> {order.refund_description}
                        </p>
                    )}
                    {(order.status === 'REJECTED' || order.status === 'REFUNDED') && order.refund_description && (
                        <p className="mb-2 text-sm sm:text-base">
                            <strong>Manager Response:</strong> {order.refund_description}
                        </p>
                    )}
                </div>
                <div className="col-span-1 flex flex-row sm:flex-col items-center justify-center sm:space-y-2 space-x-2 sm:space-x-0">
                    <button
                        onClick={handleGoToGame}
                        className="w-[150px] inline-block cursor-pointer py-3 sm:py-4 px-5 sm:px-6 bg-webgame hover:bg-webgame-dark text-white rounded-xl text-sm sm:text-base transition-colors"
                    >
                        Go to Game
                    </button>
                    {(order.status === 'PROCESSING') && (
                        <button
                            onClick={handleTakeBack}
                            className="w-[150px] inline-block cursor-pointer py-3 sm:py-4 px-5 sm:px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm sm:text-base transition-colors"
                        >
                            Take Back
                        </button>
                    )}
                    {order.status === 'PAID' && (
                        <button
                            onClick={() => setShowRefundModal(true)}
                            className="w-[150px] inline-block cursor-pointer py-3 sm:py-4 px-5 sm:px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm sm:text-base transition-colors"
                        >
                            Refund
                        </button>
                    )}
                </div>
            </div>

            {/* Refund Modal */}
            {showRefundModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Refund</h2>
                        <p className="text-gray-600 mb-4">
                            Please provide a reason for requesting a refund for <strong>{order.game.title}</strong>.
                        </p>
                        <textarea
                            value={refundDescription}
                            onChange={(e) => setRefundDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                            rows={4}
                            placeholder="Enter your reason for refund..."
                        />
                        {refundError && (
                            <p className="text-red-600 mt-2">{refundError}</p>
                        )}
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRefund}
                                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
                            >
                                Submit Refund
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserGameListItem;