'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import apiService from '@/services/apiService';

interface Order {
  id: string;
  user: { username: string };
  game: { title: string };
  buy_at: string;
  total_price: number;
  status: string;
  refund_description?: string;
}

const OrderManager = () => {
  const [showOrders, setShowOrders] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [orderToManage, setOrderToManage] = useState<Order | null>(null);
  const [managerResponse, setManagerResponse] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(''); 
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]); 
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string>('username-asc'); 
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/game/orders/');
      setOrders(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openManageModal = (order: Order) => {
    setShowManageModal(true);
    setOrderToManage(order);
    setManagerResponse('');
    setFormErrors([]);
  };

  const closeModal = () => {
    setShowManageModal(false);
    setOrderToManage(null);
    setManagerResponse('');
    setFormErrors([]);
  };

  const handleManageRefund = async (action: 'AGREE' | 'DECLINE') => {
    if (!orderToManage) return;
    if (!managerResponse.trim()) {
      setFormErrors(['Please provide a response for the refund request.']);
      return;
    }

    const newStatus = action === 'AGREE' ? 'REFUNDED' : 'REJECTED';
    const updatedDescription = `${managerResponse}`;

    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      formData.append('refund_description', updatedDescription);

      const response = await apiService.post(`/api/game/orders/${orderToManage.id}/update/`, formData);
      if (response.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderToManage.id
              ? { ...order, status: newStatus, refund_description: updatedDescription }
              : order
          )
        );
        closeModal();
      } else {
        setFormErrors([response.error || `Failed to ${action.toLowerCase()} refund.`]);
      }
    } catch (err: any) {
      setFormErrors([err.message || `Failed to ${action.toLowerCase()} refund.`]);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filteredOrders = orders;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredOrders = orders.filter(
        (order) =>
          (order.user?.username || 'unknown').toLowerCase().includes(query) ||
          (order.game?.title || 'unknown').toLowerCase().includes(query)
      );
    }

    if (selectedStatuses.length > 0) {
      filteredOrders = filteredOrders.filter((order) => selectedStatuses.includes(order.status));
    }

    const sortedOrders = [...filteredOrders];
    switch (sortOption) {
      case 'username-asc':
        sortedOrders.sort((a, b) =>
          (a.user?.username || 'unknown').localeCompare(b.user?.username || 'unknown')
        );
        break;
      case 'username-desc':
        sortedOrders.sort((a, b) =>
          (b.user?.username || 'unknown').localeCompare(a.user?.username || 'unknown')
        );
        break;
      case 'game-asc':
        sortedOrders.sort((a, b) =>
          (a.game?.title || 'unknown').localeCompare(b.game?.title || 'unknown')
        );
        break;
      case 'game-desc':
        sortedOrders.sort((a, b) =>
          (b.game?.title || 'unknown').localeCompare(a.game?.title || 'unknown')
        );
        break;
      case 'buy-date-asc':
        sortedOrders.sort((a, b) => new Date(a.buy_at).getTime() - new Date(b.buy_at).getTime());
        break;
      case 'buy-date-desc':
        sortedOrders.sort((a, b) => new Date(b.buy_at).getTime() - new Date(a.buy_at).getTime());
        break;
      case 'price-asc':
        sortedOrders.sort((a, b) => a.total_price - b.total_price);
        break;
      case 'price-desc':
        sortedOrders.sort((a, b) => b.total_price - a.total_price);
        break;
      default:
        break;
    }

    return sortedOrders;
  }, [orders, searchQuery, selectedStatuses, sortOption]);

  return (
    <section>
      <div
        className="flex items-center justify-between bg-gray-200 p-4 rounded-t-lg cursor-pointer"
        onClick={() => setShowOrders(!showOrders)}
      >
        <h2 className="text-xl font-semibold text-gray-800">Orders</h2>
        {showOrders ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </div>
      {showOrders && (
        <div className="bg-white rounded-b-lg shadow-md p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search by username or game title"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-8 bg-gray-200 rounded text-gray-800 placeholder-gray-500 focus:outline-none text-sm sm:text-base"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </span>
            </div>
            <div ref={dropdownRef} className="relative w-full sm:w-auto">
              <button
                className="w-full sm:w-auto p-3 bg-gray-200 text-gray-800 rounded border border-gray-300 flex items-center justify-between"
                onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              >
                <span>Status</span>
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full sm:w-48 bg-white border border-gray-300 rounded shadow-lg">
                  <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      value="PAID"
                      checked={selectedStatuses.includes("PAID")}
                      onChange={() => handleStatusFilterChange("PAID")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-800">Paid</span>
                  </label>
                  <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      value="PROCESSING"
                      checked={selectedStatuses.includes("PROCESSING")}
                      onChange={() => handleStatusFilterChange("PROCESSING")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-800">Processing</span>
                  </label>
                  <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      value="REFUNDED"
                      checked={selectedStatuses.includes("REFUNDED")}
                      onChange={() => handleStatusFilterChange("REFUNDED")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-800">Refunded</span>
                  </label>
                  <label className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      value="REJECTED"
                      checked={selectedStatuses.includes("REJECTED")}
                      onChange={() => handleStatusFilterChange("REJECTED")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-800">Rejected</span>
                  </label>
                </div>
              )}
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full sm:w-auto p-2 pr-8 bg-gray-200 text-gray-800 rounded border border-gray-300 focus:outline-none appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1.5em",
                }}
              >
                <option value="username-asc">Username (A-Z)</option>
                <option value="username-desc">Username (Z-A)</option>
                <option value="game-asc">Game Title (A-Z)</option>
                <option value="game-desc">Game Title (Z-A)</option>
                <option value="buy-date-asc">Buy Date (Oldest First)</option>
                <option value="buy-date-desc">Buy Date (Newest First)</option>
                <option value="price-asc">Total Price (Low to High)</option>
                <option value="price-desc">Total Price (High to Low)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : filteredAndSortedOrders.length === 0 ? (
            <p className="text-gray-600">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-800">
                    <th className="py-3 px-4 text-left">User</th>
                    <th className="py-3 px-4 text-left">Game</th>
                    <th className="py-3 px-4 text-left">Buy Date</th>
                    <th className="py-3 px-4 text-left">Total Price</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`border-b hover:bg-gray-50 ${
                        order.status === 'PROCESSING' ? 'bg-yellow-100' : ''
                      }`}
                    >
                      <td className="py-3 px-4">{order.user?.username || 'Unknown'}</td>
                      <td className="py-3 px-4">{order.game?.title || 'Unknown'}</td>
                      <td className="py-3 px-4">{new Date(order.buy_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">${order.total_price.toFixed(2)}</td>
                      <td className="py-3 px-4">{order.status}</td>
                      <td className="py-3 px-4">
                        {order.status === 'PROCESSING' && (
                          <button
                            onClick={() => openManageModal(order)}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showManageModal && orderToManage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Refund Request</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                <strong>User:</strong> {orderToManage.user?.username || 'Unknown'}
              </p>
              <p className="text-gray-600">
                <strong>Game:</strong> {orderToManage.game?.title || 'Unknown'}
              </p>
              <p className="text-gray-600">
                <strong>User’s Refund Reason:</strong>{' '}
                {orderToManage.refund_description || 'No reason provided'}
              </p>
              <div>
                <label htmlFor="manager_response" className="block text-sm font-medium text-gray-700">
                  Manager Response
                </label>
                <textarea
                  id="manager_response"
                  value={managerResponse}
                  onChange={(e) => setManagerResponse(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                  rows={4}
                  placeholder="Enter your response..."
                />
              </div>
              {formErrors.length > 0 && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                  {formErrors.map((err, index) => (
                    <p key={index}>{err}</p>
                  ))}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleManageRefund('DECLINE')}
                  className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleManageRefund('AGREE')}
                  className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-300"
                >
                  Agree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrderManager;