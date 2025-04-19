// components/publisher/PublisherProfile.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import ContactButton from "@/components/button/ContactButton";
import EditButton from "@/components/button/EditButton";

interface PublisherProfileProps {
  avatar_url: string;
  username: string;
  userId: string | null;
  profileId: string;
}

const PublisherProfile: React.FC<PublisherProfileProps> = ({ avatar_url, username, userId, profileId }) => {
  const [currentUsername, setCurrentUsername] = useState(username);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatar_url);

  const handleUpdate = (updatedUser: { username: string; avatar_url: string }) => {
    setCurrentUsername(updatedUser.username);
    setCurrentAvatarUrl(updatedUser.avatar_url);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="relative w-32 h-32 rounded-full overflow-hidden hover:scale-105 transition-transform duration-300">
        <Image
          src={currentAvatarUrl || '/defaultavatar.jpg'}
          alt={`${currentUsername}'s avatar`}
          fill
          className="object-cover"
          priority
        />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">{currentUsername}</h1>
      {userId != profileId && (
        <div className="mt-4">
          <ContactButton
            userId={userId}
            publisherId={profileId}
          />
        </div>
      )}
      {userId === profileId && (
        <div className="mt-4">
          <EditButton
            userId={userId}
            username={currentUsername}
            onUpdate={handleUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default PublisherProfile;