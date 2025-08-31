"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/providers/AuthProvider";

interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
}

interface Conversation {
  id: number;
  type: "direct" | "group";
  name: string | null;
}

export default function Messages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, error } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (loading) return;
    if (error || !user) {
      router.push(`/?error=${encodeURIComponent(error || "unauthenticated")}`);
      return;
    }

    const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (!authToken) {
      router.push("/?error=unauthenticated");
      return;
    }

    // Fetch conversations
    axios
      .get("/api/conversations", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setConversations(res.data))
      .catch((err) => {
        console.error("Fetch conversations error:", err);
        router.push("/?error=fetch_conversations_failed");
      });

    // Setup WebSocket
    wsRef.current = new WebSocket(
      `ws://localhost:3000?auth_token=${authToken}`
    );
    wsRef.current.onopen = () => console.log("WebSocket connected");
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };
    wsRef.current.onclose = () => console.log("WebSocket disconnected");
    wsRef.current.onerror = (error) => console.error("WebSocket error:", error);

    return () => wsRef.current?.close();
  }, [router, searchParams, user, loading, error]);

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageInput || !user) return;
    const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    try {
      const response = await axios.post(
        "/api/messages",
        {
          conversationId: selectedConversation,
          content: messageInput,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      wsRef.current?.send(
        JSON.stringify({
          type: "message",
          payload: {
            conversationId: selectedConversation,
            content: messageInput,
            senderId: user.id,
            id: response.data.messageId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isRead: false,
          },
        })
      );
      setMessageInput("");
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  const handleSelectConversation = async (conversationId: number) => {
    setSelectedConversation(conversationId);
    try {
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];
      const res = await axios.get(
        `/api/messages?conversationId=${conversationId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setMessages(res.data);

      // Mark messages as read
      const unreadMessageIds = res.data
        .filter((msg: Message) => !msg.isRead && msg.senderId !== user?.id)
        .map((msg: Message) => msg.id);
      if (unreadMessageIds.length > 0) {
        await axios.patch(
          "/api/messages/read",
          {
            messageIds: unreadMessageIds,
            conversationId,
          },
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        <ul>
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`p-2 cursor-pointer rounded ${
                selectedConversation === conv.id
                  ? "bg-blue-200"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => handleSelectConversation(conv.id)}
            >
              {conv.name || `Conversation ${conv.id}`}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Messages of {user?.name}</h2>
        <div className="flex-1 overflow-y-auto mb-4 p-4 bg-white rounded border">
          {selectedConversation ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 p-2 rounded ${
                  msg.senderId === user?.id
                    ? "bg-blue-100 ml-auto"
                    : "bg-gray-100 mr-auto"
                } max-w-[70%]`}
              >
                <span className="font-bold">
                  {msg.senderId === user?.id ? "You" : msg.senderId}:{" "}
                </span>
                {msg.content}
                {msg.isRead && msg.senderId === user?.id && (
                  <span className="text-xs text-gray-500 ml-2">Read</span>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
        {selectedConversation && (
          <div className="flex">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
