'use client';

import Link from 'next/link';
import { Users, Gamepad2, Settings } from 'lucide-react'; // Using Lucide icons for simplicity

const ManagePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-[1500px] mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Manage Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage users, games, and website settings.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1500px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manage User Card */}
          <Link href="/manage/users" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center space-x-4">
                <Users className="w-10 h-10 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Manage Users</h2>
                  <p className="mt-1 text-gray-600">View, edit, or delete user accounts.</p>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300">
                Manage
              </button>
            </div>
          </Link>

          {/* Manage Game Card */}
          <Link href="/manage/games" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center space-x-4">
                <Gamepad2 className="w-10 h-10 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Manage Games</h2>
                  <p className="mt-1 text-gray-600">Add, edit, or delete games.</p>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-300">
                Manage
              </button>
            </div>
          </Link>

          {/* Manage Website Card */}
          <Link href="/manage/website" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center space-x-4">
                <Settings className="w-10 h-10 text-purple-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Manage Website</h2>
                  <p className="mt-1 text-gray-600">Update site settings and configurations.</p>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-300">
                Manage
              </button>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ManagePage;