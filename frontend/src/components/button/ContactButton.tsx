// components/button/ContactButton.tsx
'use client';

import useLoginModal from "@/hooks/useLoginModal";
import { useRouter } from "next/navigation";
import apiService from "@/services/apiService";

interface ContactButtonProps {
  userId: string | null;
  publisherId: string;
}

const ContactButton: React.FC<ContactButtonProps> = ({ userId, publisherId }) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  const startConversation = async () => {
    if (userId) {
      const conversation = await apiService.get(`/api/chat/start/${publisherId}`);
      if (conversation.conversation_id) {
        router.push(`/inbox/${conversation.conversation_id}`);
      }
    } else {
      loginModal.open();
    }
  };

  return (
    <div 
      onClick={startConversation}
      className="py-2 px-4 cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
    >
      Contact
    </div>
  );
};

export default ContactButton;