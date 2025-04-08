'use client';

import { useEffect, useState, useRef } from "react";
import CustomButton from "../form/CustomButton";
import { ConversationType } from "@/app/inbox/page";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { MessageType } from "@/app/inbox/[id]/page";
import { UserType } from "@/app/inbox/page";

interface ConversationDetailProps {
    token: string;
    userId: string;
    conversation: ConversationType;
    messages: MessageType[];
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({
    userId,
    token,
    messages,
    conversation
}) => {
    const messagesDiv = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState('');
    const myUser = conversation.users?.find((user) => user.id == userId);
    const otherUser = conversation.users?.find((user) => user.id != userId);
    const [realtimeMessages, setRealtimeMessages] = useState<MessageType[]>([]);
    const [wsError, setWsError] = useState<string | null>(null);

    const wsUrl = `ws://localhost:8000/ws/${conversation.id}/?token=${token}`;
    console.log('WebSocket URL:', wsUrl); // Debug log

    const { sendJsonMessage, lastJsonMessage, readyState, lastMessage } = useWebSocket(wsUrl, {
        share: false,
        shouldReconnect: () => true,
        onError: (event) => {
            console.error('WebSocket Error:', event);
            setWsError('Failed to connect to the chat server. Please try again later.');
        },
        onClose: (event) => {
            console.log('WebSocket Closed:', event);
            setWsError('Chat connection closed. Please refresh the page to reconnect.');
        },
        onMessage: (event) => {
            console.log('Raw WebSocket Message:', event.data); // Debug log
        },
    });

    useEffect(() => {
        console.log("Connection state changed", readyState);
        if (readyState === ReadyState.OPEN) {
            setWsError(null); // Clear error when connection is established
        }
    }, [readyState]);

    useEffect(() => {
        if (lastJsonMessage && typeof lastJsonMessage === 'object' && 'username' in lastJsonMessage && 'body' in lastJsonMessage) {
            const message: MessageType = {
                id: '',
                username: lastJsonMessage.username as string,
                body: lastJsonMessage.body as string,
                sent_to: otherUser as UserType,
                created_by: myUser as UserType,
                conversationId: conversation.id
            };

            setRealtimeMessages((realtimeMessages) => [...realtimeMessages, message]);
        } else if (lastMessage) {
            console.error('Invalid WebSocket message format:', lastMessage.data);
        }

        scrollToBottom();
    }, [lastJsonMessage, lastMessage]);

    const sendMessage = async () => {
        if (readyState !== ReadyState.OPEN) {
            setWsError('Chat connection is not open. Please wait or refresh the page.');
            return;
        }

        console.log('Sending message:', newMessage);
        sendJsonMessage({
            event: 'chat_message',
            data: {
                body: newMessage,
                username: myUser?.username,
                sent_to_id: otherUser?.id,
                conversation_id: conversation.id
            }
        });

        setNewMessage('');

        setTimeout(() => {
            scrollToBottom();
        }, 50);
    };

    const scrollToBottom = () => {
        if (messagesDiv.current) {
            messagesDiv.current.scrollTop = messagesDiv.current.scrollHeight;
        }
    };

    return (
        <div className="flex flex-col h-[80vh] max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-lg border border-gray-200">
            {wsError && (
                <div className="p-4 bg-red-100 text-red-700 rounded-t-lg">
                    {wsError}
                </div>
            )}
            {/* Messages Section */}
            <div 
                ref={messagesDiv}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-white rounded-t-lg"
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.created_by.username == myUser?.username ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`w-[80%] py-4 px-6 rounded-xl ${message.created_by.username == myUser?.username ? 'ml-[20%] bg-blue-200' : 'bg-gray-200'}`}
                        >
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                {message.created_by.username}
                            </p>
                            <p className="text-base">{message.body}</p>
                        </div>
                    </div>
                ))}

                {realtimeMessages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.username == myUser?.username ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`w-[80%] py-4 px-6 rounded-xl ${message.username == myUser?.username ? 'ml-[20%] bg-blue-200' : 'bg-gray-200'}`}
                        >
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                {message.username}
                            </p>
                            <p className="text-base">{message.body}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer with Input and Button */}
            <div className="sticky bottom-0 w-full p-4 bg-gray-100 border-t border-gray-200 rounded-b-lg flex items-center space-x-4">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <CustomButton 
                    label='Send'
                    onClick={sendMessage}
                    className="w-[100px] bg-pink-500 text-white rounded-full p-3 hover:bg-pink-600 transition-colors duration-200"
                />
            </div>
        </div>
    );
};

export default ConversationDetail;