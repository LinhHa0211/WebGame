'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ConversationType } from "@/app/inbox/page";

interface ConversationProps {
    conversation: ConversationType;
    userId: string;
}

const Conversation: React.FC<ConversationProps> = ({
    conversation,
    userId
}) => {
    const router = useRouter();
    const otherUser = conversation.users.find((user) => user.id != userId)
    console.log(otherUser)
    return (
        <div 
            onClick={() => router.push(`/inbox/${conversation.id}`)}
            className="px-6 py-4 cursor-pointer border border-gray-300 rounded-xl flex items-center gap-4 hover:bg-gray-100 transition"
        >
            <Image
                src={otherUser?.avatar_url || '/defaultavatar.jpg'}
                width={60}
                height={60}
                alt="Publisher Avatar"
                className="rounded-xl w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-cover"
            />
            <p className="text-lg sm:text-xl md:text-2xl font-medium truncate flex-1">
                {otherUser?.username}
            </p>
        </div>
    )
}

export default Conversation;