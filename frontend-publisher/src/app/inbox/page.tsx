import { getUserId } from "@/lib/actions";
import apiService from "@/services/apiService";
import Conversation from "@/components/inbox/Conversation";

export type UserType = {
    id: string;
    username: string;
    avatar_url: string;
}

export type ConversationType = {
    id: string;
    users: UserType[];
    modified_at: Date
}

const InboxPage = async () => {
    const userId = await getUserId();

    if (!userId) {
        return (
            <main className="max-w-[1500px] max-auto px-6 py-12">
                <p>You need to be authenticated...</p>
            </main>
        )
    }

    const conversations = await apiService.get('/api/chat/')

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6 space-y-4">
            {conversations.map((conversation: ConversationType) => {
                return (
                    <Conversation 
                        userId={userId}
                        key={conversation.id}
                        conversation={conversation}
                    />
                )
            })}
        </main>
    )
}

export default InboxPage;