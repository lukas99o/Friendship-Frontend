import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import type { EventMessageDto } from "../types";
import { API_BASE_URL } from "../config";

interface Props {
  conversationId: number;
  senderId: string;
  messageList?: EventMessageDto[];
}

export default function EventChat({ conversationId, senderId, messageList }: Props) {
  const [messages, setMessages] = useState<EventMessageDto[]>(messageList || []);
  const [messageText, setMessageText] = useState("");
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!conversationId) {
      console.error("No conversation ID provided");
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/messageHub`)
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => connection.invoke("JoinConversation", conversationId))
      .catch(err => console.error("SignalR connection failed: ", err));

    connection.on("ReceiveMessage", (message: EventMessageDto) => {
      setMessages(prev => [...prev, message]);
    });

    connectionRef.current = connection;
    return () => {
      if (connectionRef.current) {
        connectionRef.current.invoke("LeaveConversation", conversationId)
          .catch(() => {})
          .finally(() => connectionRef.current?.stop());
      }
    };
  }, [conversationId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (connectionRef.current && messageText.trim()) {
      await connectionRef.current.invoke("SendMessage", conversationId, senderId, messageText);
      setMessageText("");
    }
  };

  return (
    <div>
      <div 
        ref={scrollContainerRef}
        className="border rounded-3 p-3 mb-3 bg-white shadow-sm position-relative"
        style={{ height: "300px", overflowY: "auto", background: "linear-gradient(145deg, #f8f9fa, #e9ecef)" }}
      >
        {messages.length > 0 ? (
          messages.map(msg => (
            <div key={msg.messageId} className="mb-2">
              <strong>{msg.senderName}</strong> <small className="text-muted">{new Date(msg.createdAt).toLocaleString()}</small>
              <p className="mb-0">{msg.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-muted h-100 d-flex align-items-center justify-content-center flex-column">
            <i className="bi bi-chat-dots-fill fs-1 opacity-50 mb-3"></i>
            <p className="mb-0">No messages yet...</p>
            <small>Be the first to start the conversation!</small>
          </div>
        )}
      </div>

      <div className="input-group shadow-sm">
        <span className="input-group-text bg-warning border-warning">
          <i className="bi bi-chat-fill text-white"></i>
        </span>
        <input
          type="text"
          className="form-control border-warning"
          placeholder="Write a message..."
          style={{ borderLeft: "none" }}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="btn btn-warning px-4 fw-bold" onClick={sendMessage}>
          <i className="bi bi-send-fill me-1"></i> Send
        </button>
      </div>
    </div>
  );
}