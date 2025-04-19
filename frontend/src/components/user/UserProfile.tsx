'use client';

import { useState } from 'react';
import Image from 'next/image';
import ContactButton from "@/components/button/ContactButton";
import EditButton from '../button/EditButton';

interface UserProfileProps {
  avatar_url: string;
  email: string;
  username: string;
  userId: string;
  logUser: string | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ avatar_url, email, username, userId, logUser }) => {
    const [currentUsername, setCurrentUsername] = useState(username);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatar_url);
    const handleUpdate = (updatedUser: { username: string; avatar_url: string }) => {
        setCurrentUsername(updatedUser.username);
        setCurrentAvatarUrl(updatedUser.avatar_url);
        window.location.reload()
    };
    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="relative w-24 h-24 rounded-full overflow-hidden hover:scale-105 transition-transform duration-300">
            <Image
            src={avatar_url || '/defaultavatar.jpg'}
            alt={`${username}'s avatar`}
            fill
            className="object-cover"
            priority // Add priority to improve LCP
            />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{username}</h1>
        <p className="mt-1 text-md text-gray-600"><strong>Email: </strong>{email}</p>
        {logUser != userId && (
            <ContactButton
                userId={logUser}
                publisherId={userId}
            />
        )}
        {logUser && logUser === userId && (
            <EditButton
                userId={logUser}
                username={currentUsername}
                onUpdate={handleUpdate}
            />
        )}
        </div>
    );
};

export default UserProfile;