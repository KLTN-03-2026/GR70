import { useState, useRef, useEffect } from "react";
import socket from "../services/Socket";
import axios from "axios";

export default function ChatWidget({ userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [chatList, setChatList] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");

    const bottomRef = useRef(null);
    const API = "https://system-waste-less-ai.onrender.com/api";

    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };

    // ================= LOAD LIST CHAT =================
    useEffect(() => {
        if (!userId) return;

        const fetchList = async () => {
            try {
                const res = await axios.get(`${API}/chat/list-message`, config);
                setChatList(res.data.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchList();
    }, [userId]);

    // ================= JOIN USER =================
    useEffect(() => {
        if (!userId) return;
        socket.emit("join_user", userId);
    }, [userId]);

    // ================= JOIN ROOM =================
    useEffect(() => {
        if (!activeChat) return;

        const joinRoom = () => {
            socket.emit("join_message", activeChat);
        };

        if (socket.connected) {
            joinRoom();
        } else {
            socket.on("connect", joinRoom);
        }

        const handleIncoming = (data) => {
            setMessages((prev) => {
                if (String(data.message_id) !== String(activeChat)) return prev;

                const exists = prev.find((m) => String(m.id) === String(data.id));
                if (exists) return prev;

                return [...prev, data];
            });
        };

        socket.off("receive_message", handleIncoming);
        socket.on("receive_message", handleIncoming);

        return () => {
            socket.off("receive_message", handleIncoming);
            socket.off("connect", joinRoom);
        };
    }, [activeChat]);

    // ================= NOTIFICATION =================
    useEffect(() => {
        if (!userId) return;

        const handler = (data) => {
            setChatList((prev) =>
                prev.map((chat) => {
                    if (String(chat.id) !== String(data.message_id)) return chat;

                    const isActive =
                        String(activeChat) === String(data.message_id);

                    return {
                        ...chat,
                        other_unread_count: isActive
                            ? 0
                            : (chat.other_unread_count || 0) + 1,
                    };
                })
            );

            // nếu đang mở đúng chat thì add message ngay
            if (String(data.message_id) === String(activeChat)) {
                setMessages((prev) => {
                    const exists = prev.find((m) => String(m.id) === String(data.id));
                    if (exists) return prev;
                    return [...prev, data];
                });
            }
        };

        socket.off("new_message_notification", handler);
        socket.on("new_message_notification", handler);

        return () => {
            socket.off("new_message_notification", handler);
        };
    }, [userId, activeChat]);

    // ================= CLICK CHAT =================
    const handleSelectChat = async (chatId) => {
        try {
            setActiveChat(chatId);
            setMessages([]);

            const res = await axios.get(
                `${API}/chat/get-message/${chatId}`,
                config
            );

            setMessages(res.data.data || []);

            await axios.put(`${API}/chat/mark-as-read/${chatId}`,{}, config);

            setChatList((prev) =>
                prev.map((chat) =>
                    String(chat.id) === String(chatId)
                        ? { ...chat, other_unread_count: 0 }
                        : chat
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    // ================= AUTO SCROLL =================
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ================= SEND =================
    const handleSend = async () => {
        if (!content.trim() || !activeChat) return;

        try {
            const res = await axios.post(
                `${API}/chat/send`,
                {
                    message_id: activeChat,
                    content: content,
                },
                config
            );

            setMessages((prev) => {
                const exists = prev.find(
                    (m) => String(m.id) === String(res.data.data.id)
                );
                if (exists) return prev;
                return [...prev, res.data.data];
            });

            setContent("");
        } catch (err) {
            console.error(err);
        }
    };

    // ================= TOTAL BADGE =================
    const totalUnread = chatList.reduce(
        (sum, chat) => sum + (chat.other_unread_count || 0),
        0
    );

    return (
        <>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    cursor: "pointer",
                    zIndex: 9999,
                }}
            >
                <div className="relative w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white text-xl shadow-lg">
                    💬
                    {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                            {totalUnread}
                        </span>
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="fixed bottom-24 right-10 w-[500px] h-[600px] bg-white rounded-2xl shadow-2xl flex overflow-hidden">
                    <div className="w-[180px] bg-gray-50 border-r flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            {chatList.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => handleSelectChat(chat.id)}
                                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-200 ${
                                        activeChat === chat.id ? "bg-gray-300" : ""
                                    }`}
                                >
                                    <img
                                        src={`https://i.pravatar.cc/40?u=${chat.other_user_id}`}
                                        className="w-8 h-8 rounded-full"
                                    />

                                    <div className="flex-1 text-xs font-medium">
                                        {chat.other_user_name}
                                    </div>

                                    {chat.other_unread_count > 0 && (
                                        <div className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                                            {chat.other_unread_count}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="p-3 border-b flex items-center">
                            <span className="font-medium text-sm">
                                {chatList.find((c) => c.id === activeChat)?.other_user_name || "Chat"}
                            </span>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="ml-auto"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-100 text-sm">
                            {messages.map((msg) => {
                                const isMe = String(msg.user_id) === String(userId);

                                return isMe ? (
                                    <div key={msg.id} className="flex justify-end">
                                        <div className="bg-green-500 text-white px-3 py-2 rounded-xl max-w-[70%]">
                                            {msg.content}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={msg.id} className="flex items-end gap-2">
                                        <img
                                            src="https://i.pravatar.cc/30"
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <div className="bg-white px-3 py-2 rounded-xl max-w-[70%]">
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={bottomRef}></div>
                        </div>

                        {activeChat && (
                            <div className="p-2 border-t flex gap-2">
                                <input
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 border rounded-full px-3 py-2 text-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-green-500 text-white px-4 rounded-full"
                                >
                                    Gửi
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}