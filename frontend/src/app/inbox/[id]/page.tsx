import { getUserId } from '@/lib/actions';
import apiService from '@/services/apiService';
import ConversationDetail from '@/components/inbox/ConversationDetail';
import { UserType } from "../page";
import { getAccessToken } from '@/lib/actions';

export type MessageType = {
    id: string;
    username: string;
    body: string;
    conversationId: string;
    sent_to: UserType;
    created_by: UserType
}

const ConversationPage = async ({ params }: { params: {id: string }}) => {
    const userId = await getUserId();
    const token = await getAccessToken();

    if (!userId || !token) {
        return (
            <main className="max-w-[1500px] max-auto px-6 py-12">
                <p>You need to be authenticated...</p>
            </main>
        )
    }

    const conversation = await apiService.get(`/api/chat/${params.id}/`)

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <ConversationDetail 
                token={token}
                userId={userId}
                messages={conversation.messages}
                conversation={conversation.conversation}
            />
        </main>
    )
}

export default ConversationPage;