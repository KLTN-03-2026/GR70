import { useState, useRef, useEffect } from "react";
import socket from "../services/Socket";
import axios from "axios";

export default function ChatWidget({ userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [chatList, setChatList] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [size] = useState(20);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const bottomRef = useRef(null);
    const messageBoxRef = useRef(null);
    const shouldScrollToBottomRef = useRef(false);

    const API = "https://system-waste-less-ai.onrender.com/api";

    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };

    const normalizeDescMessages = (list = []) => {
        return [...list].reverse();
    };

    const scrollToBottom = (smooth = true) => {
        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({
                behavior: smooth ? "smooth" : "auto",
                block: "end",
            });
        });
    };

    const markAsReadByChatId = async (chatId) => {
        if (!chatId) return;

        try {
            await axios.put(`${API}/chat/mark-as-read/${chatId}`, {}, config);

            setChatList((prev) =>
                prev.map((chat) =>
                    String(chat.id) === String(chatId)
                        ? { ...chat, other_unread_count: 0 }
                        : chat
                )
            );
        } catch (err) {
            console.error("mark-as-read error:", err);
        }
    };

    const resetChatState = () => {
        setActiveChat(null);
        setMessages([]);
        setContent("");
        setSearch("");
        setPage(1);
        setHasMore(true);
        setLoadingMore(false);
        shouldScrollToBottomRef.current = false;
    };

    const handleToggleWidget = () => {
        if (isOpen) {
            setIsOpen(false);
            resetChatState();
            return;
        }

        setIsOpen(true);
    };

    const handleCloseChat = () => {
        setIsOpen(false);
        resetChatState();
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
        if (!activeChat || !isOpen) return;

        const joinRoom = () => {
            socket.emit("join_message", activeChat);
        };

        if (socket.connected) {
            joinRoom();
        } else {
            socket.on("connect", joinRoom);
        }

        const handleIncoming = (data) => {
            if (String(data.message_id) !== String(activeChat)) return;

            shouldScrollToBottomRef.current = true;

            setMessages((prev) => {
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
    }, [activeChat, isOpen]);

    // ================= NOTIFICATION =================
    useEffect(() => {
        if (!userId) return;

        const handler = (data) => {
            setChatList((prev) =>
                prev.map((chat) => {
                    if (String(chat.id) !== String(data.message_id)) return chat;

                    const isCurrentOpenChat =
                        isOpen && String(activeChat) === String(data.message_id);

                    return {
                        ...chat,
                        other_unread_count: isCurrentOpenChat
                            ? 0
                            : (chat.other_unread_count || 0) + 1,
                    };
                })
            );

            if (isOpen && String(data.message_id) === String(activeChat)) {
                shouldScrollToBottomRef.current = true;

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
    }, [userId, activeChat, isOpen]);

    // ================= LOAD MORE WHEN SCROLL TOP =================
    const loadMoreMessages = async () => {
        if (!activeChat || loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);

            const nextPage = page + 1;
            const oldHeight = messageBoxRef.current?.scrollHeight || 0;

            const res = await axios.get(
                `${API}/chat/get-message/${activeChat}?page=${nextPage}&size=${size}`,
                config
            );

            const olderMessagesDesc = res.data.data || [];
            const olderMessages = normalizeDescMessages(olderMessagesDesc);

            if (olderMessages.length === 0) {
                setHasMore(false);
                return;
            }

            setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => String(m.id)));
                const uniqueOlder = olderMessages.filter(
                    (m) => !existingIds.has(String(m.id))
                );
                return [...uniqueOlder, ...prev];
            });

            setPage(nextPage);

            if (olderMessagesDesc.length < size) {
                setHasMore(false);
            }

            setTimeout(() => {
                if (messageBoxRef.current) {
                    const newHeight = messageBoxRef.current.scrollHeight;
                    messageBoxRef.current.scrollTop = newHeight - oldHeight;
                }
            }, 50);
        } catch (err) {
            console.error("loadMoreMessages error:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScrollMessages = async (e) => {
        const el = e.currentTarget;
        if (el.scrollTop <= 20) {
            await loadMoreMessages();
        }
    };

    // ================= CLICK CHAT =================
    const handleSelectChat = async (chatId) => {
        try {
            setIsOpen(true);
            setActiveChat(chatId);
            setMessages([]);
            setContent("");
            setPage(1);
            setHasMore(true);
            setLoadingMore(false);

            const res = await axios.get(
                `${API}/chat/get-message/${chatId}?page=1&size=${size}`,
                config
            );

            const firstMessagesDesc = res.data.data || [];
            const firstMessages = normalizeDescMessages(firstMessagesDesc);

            setMessages(firstMessages);

            if (firstMessagesDesc.length < size) {
                setHasMore(false);
            }

            await markAsReadByChatId(chatId);

            shouldScrollToBottomRef.current = true;
        } catch (err) {
            console.error(err);
        }
    };

    // ================= FOCUS INPUT NHẮN TIN =================
    const handleFocusMessageInput = async () => {
        if (!activeChat) return;

        await markAsReadByChatId(activeChat);
        shouldScrollToBottomRef.current = true;
        setTimeout(() => {
            scrollToBottom(false);
        }, 50);
    };

    // ================= AUTO SCROLL =================
    useEffect(() => {
        if (!isOpen || !activeChat) return;
        if (!shouldScrollToBottomRef.current) return;

        scrollToBottom(true);
        shouldScrollToBottomRef.current = false;
    }, [messages, isOpen, activeChat]);

    // ================= SEND =================
    const handleSend = async () => {
        if (!content.trim() || !activeChat) return;

        try {
            const res = await axios.post(
                `${API}/chat/send`,
                {
                    message_id: activeChat,
                    content: content.trim(),
                },
                config
            );

            shouldScrollToBottomRef.current = true;

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

    const handleKeyDownMessage = async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            await handleSend();
        }
    };

    // ================= FILTER CHAT LIST =================
    const filteredChatList = chatList.filter((chat) =>
        (chat.other_user_name || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // ================= TOTAL BADGE =================
    const totalUnread = chatList.reduce(
        (sum, chat) => sum + (chat.other_unread_count || 0),
        0
    );

    return (
        <>
            <div
                onClick={handleToggleWidget}
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
                        <div className="p-3">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm..."
                                className="w-full px-3 py-2 text-sm rounded-full bg-gray-200 outline-none"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredChatList.map((chat) => (
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
                                        alt=""
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
                                onClick={handleCloseChat}
                                className="ml-auto"
                            >
                                ✖
                            </button>
                        </div>

                        <div
                            ref={messageBoxRef}
                            onScroll={handleScrollMessages}
                            className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-100 text-sm"
                        >
                            {loadingMore && (
                                <div className="text-center text-xs text-gray-500">
                                    Đang tải thêm...
                                </div>
                            )}

                            {messages.map((msg) => {
                                const isMe = String(msg.user_id) === String(userId);

                                return isMe ? (
                                    <div key={msg.id} className="flex justify-end">
                                        <div className="bg-green-500 text-white px-3 py-2 rounded-xl max-w-[70%] break-words">
                                            {msg.content}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={msg.id} className="flex items-end gap-2">
                                        <img
                                            src="https://i.pravatar.cc/30"
                                            className="w-6 h-6 rounded-full"
                                            alt=""
                                        />
                                        <div className="bg-white px-3 py-2 rounded-xl max-w-[70%] break-words">
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={bottomRef} />
                        </div>

                        {activeChat && (
                            <div className="p-2 border-t flex gap-2">
                                <input
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onFocus={handleFocusMessageInput}
                                    onKeyDown={handleKeyDownMessage}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 border rounded-full px-3 py-2 text-sm outline-none"
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