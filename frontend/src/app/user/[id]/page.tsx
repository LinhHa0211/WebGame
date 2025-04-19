// app/user/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import UserProfile from '@/components/user/UserProfile';
import PurchasedGameList from '@/components/user/PurchaseGame';
import apiService from '@/services/apiService';
import { getUserId } from '@/lib/actions';

interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
}

const UserPage = ({ params: paramsPromise }: { params: Promise<{ id: string }> }) => {
  const params = use(paramsPromise);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [logUser, setLogUser] = useState('')

  useEffect(() => {
    const fetchLogUser = async () => {
        const temp = await getUserId()
        if(temp){
            setLogUser(temp)
        }
    }
    fetchLogUser();
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(`/api/auth/${params.id}`);
        if (response && typeof response === 'object' && 'error' in response) {
          throw new Error(response.error);
        }

        setUser(response);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching user:', error.message, error);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-center font-semibold">{error}</p>;
  }

  if (!user) {
    return <p className="text-gray-600 text-center">Loading user data...</p>;
  }

  return (
    <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* User Profile Section */}
        <aside className="col-span-1">
          <UserProfile
            avatar_url={user.avatar_url}
            email={user.email}
            username={user.username}
            userId={user.id}
            logUser={logUser}
          />
        </aside>

        {/* Purchased Games Section */}
        <div className="col-span-1 md:col-span-3">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchased Games</h2>
          <PurchasedGameList userId={params.id} />
        </div>
      </div>
    </main>
  );
};

export default UserPage;