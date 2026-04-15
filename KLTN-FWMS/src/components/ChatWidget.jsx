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
    const API = 'https://system-waste-less-ai.onrender.com/api';

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
                setChatList(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchList();
    }, [userId]);

    // ================= JOIN ROOM =================
    useEffect(() => {
    if (!activeChat) return;

    const joinRoom = () => {
        console.log("📥 JOIN ROOM:", activeChat);
        socket.emit("join_message", activeChat);
    };

    if (socket.connected) {
        joinRoom();
    } else {
        socket.on("connect", joinRoom);
    }

    const handleIncoming = (data) => {
        console.log("📩 incoming:", data);

        setMessages((prev) => {
            if (data.message_id !== activeChat) return prev;

            const exists = prev.find((m) => m.id === data.id);
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

    useEffect(() => {
        if (!userId) return;

        const handler = (data) => {
            console.log("🔔 notification:", data);

            // 🔥 LUÔN update chatList
            setChatList((prev) => {
                const exists = prev.find(c => c.id === data.message_id);
                if (!exists) return prev;
                return prev;
            });

            // 🔥 nếu đang mở chat → add message
            if (data.message_id === activeChat) {
                setMessages((prev) => {
                    const exists = prev.find((m) => m.id === data.id);
                    if (exists) return prev;
                    return [...prev, data];
                });
            }

            // ❗ KHÔNG return sớm nữa
        };

        socket.off("new_message_notification");
        socket.on("new_message_notification", handler);

        return () => {
            socket.off("new_message_notification");
        };
    }, [userId, activeChat]);

    // ================= LOAD MESSAGE =================
    useEffect(() => {
        if (!activeChat) return;

        setMessages([]); // 🔥 reset khi đổi room

        const fetchMessages = async () => {
            try {
                const res = await axios.get(
                    `${API}/chat/get-message/${activeChat}`, config
                );

                setMessages(res.data.data);

                await axios.get(`${API}/chat/mark-as-read/${activeChat}`, config);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMessages();
    }, [activeChat]);

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

            // ✅ ADD NGAY VÀO UI (QUAN TRỌNG)
            setMessages((prev) => [...prev, res.data.data]);

            setContent("");
        } catch (err) {
            console.error("❌ Send lỗi:", err.response?.data || err);
        }
    };

    // =========  JOIN USSER  ==========
    useEffect(() => {
    if (!userId) return;

    console.log("🔌 JOIN USER:", userId);
    socket.emit("join_user", userId);
}, [userId]);

    return (
        <>
            {/* ICON */}
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
                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white text-xl shadow-lg">
                    💬
                </div>
            </div>

            {/* CHAT BOX */}
            {isOpen && (
                <div className="fixed bottom-24 right-10 w-[500px] h-[600px] bg-white rounded-2xl shadow-2xl flex overflow-hidden">

                    {/* SIDEBAR */}
                    <div className="w-[180px] bg-gray-50 border-r flex flex-col">
                        <div className="p-3">
                            <input
                                placeholder="Tìm..."
                                className="w-full px-3 py-2 text-sm rounded-full bg-gray-200"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {chatList.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => setActiveChat(chat.id)}
                                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-200 ${activeChat === chat.id && "bg-gray-300"
                                        }`}
                                >
                                    <img
                                        src={`https://i.pravatar.cc/40?u=${chat.other_user_id}`}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="text-xs font-medium">
                                        {chat.other_user_name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CHAT */}
                    <div className="flex-1 flex flex-col">

                        {/* HEADER */}
                        <div className="p-3 border-b flex items-center">
                            <span className="font-medium text-sm">
                                {chatList.find(c => c.id === activeChat)?.other_user_name || "Chat"}
                            </span>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="ml-auto"
                            >
                                ✖
                            </button>
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-100 text-sm">
                            {messages.map((msg) => {
                                const isMe = msg.user_id === userId;

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

                        {/* INPUT */}
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