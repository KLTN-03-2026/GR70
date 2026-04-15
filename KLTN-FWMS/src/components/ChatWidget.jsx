import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
    const [loadingChats, setLoadingChats] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const bottomRef = useRef(null);
    const messageBoxRef = useRef(null);
    const shouldScrollToBottomRef = useRef(false);
    const lastOpenedChatRef = useRef(null);

    const API = "https://system-waste-less-ai.onrender.com/api";

    const config = useMemo(
        () => ({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }),
        []
    );

    const isSameId = (a, b) => String(a) === String(b);
    const safeArray = (value) => (Array.isArray(value) ? value : []);

    const extractPaginatedList = (res) => {
        if (Array.isArray(res?.data?.data?.data)) return res.data.data.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.data)) return res.data;
        return [];
    };

    const extractPaginationMeta = (res) => {
        return {
            total: res?.data?.data?.total ?? 0,
            page: res?.data?.data?.page ?? 1,
            size: res?.data?.data?.size ?? 0,
            totalPages: res?.data?.data?.totalPages ?? 1,
        };
    };

    const normalizeDescMessages = (list = []) => {
        return safeArray(list).slice().reverse();
    };

    const mergeUniqueMessages = (oldList, newList, mode = "append") => {
        const current = safeArray(oldList);
        const incoming = safeArray(newList);
        const map = new Map();

        if (mode === "prepend") {
            [...incoming, ...current].forEach((msg) => {
                if (msg?.id != null) {
                    map.set(String(msg.id), msg);
                }
            });
        } else {
            [...current, ...incoming].forEach((msg) => {
                if (msg?.id != null) {
                    map.set(String(msg.id), msg);
                }
            });
        }

        return Array.from(map.values()).sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
    };

    const scrollToBottom = useCallback((smooth = false) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (messageBoxRef.current) {
                    messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
                }

                bottomRef.current?.scrollIntoView({
                    behavior: smooth ? "smooth" : "auto",
                    block: "end",
                });
            });
        });
    }, []);

    const updateChatPreview = useCallback((message) => {
        if (!message?.message_id) return;

        setChatList((prev) => {
            const list = safeArray(prev);
            const index = list.findIndex((chat) =>
                isSameId(chat.id, message.message_id)
            );

            if (index === -1) return list;

            const updated = [...list];
            updated[index] = {
                ...updated[index],
                last_message: message.content,
                last_message_at: message.created_at,
            };

            return updated;
        });
    }, []);

    const incrementUnreadIfNeeded = useCallback(
        (message) => {
            if (!message?.message_id) return;

            setChatList((prev) =>
                safeArray(prev).map((chat) => {
                    if (!isSameId(chat.id, message.message_id)) return chat;

                    const isCurrentOpenChat =
                        isOpen && activeChat && isSameId(activeChat, message.message_id);

                    return {
                        ...chat,
                        other_unread_count: isCurrentOpenChat
                            ? 0
                            : (chat.other_unread_count || 0) + 1,
                    };
                })
            );
        },
        [activeChat, isOpen]
    );

    const markAsReadByChatId = useCallback(
        async (chatId) => {
            if (!chatId) return;

            try {
                await axios.put(`${API}/chat/mark-as-read/${chatId}`, {}, config);

                setChatList((prev) =>
                    safeArray(prev).map((chat) =>
                        isSameId(chat.id, chatId)
                            ? { ...chat, other_unread_count: 0 }
                            : chat
                    )
                );
            } catch (err) {
                console.error("mark-as-read error:", err);
            }
        },
        [API, config]
    );

    const resetChatState = ({ keepLastChat = true } = {}) => {
        if (!keepLastChat) {
            lastOpenedChatRef.current = null;
        }

        setActiveChat(null);
        setMessages([]);
        setContent("");
        setSearch("");
        setPage(1);
        setHasMore(true);
        setLoadingMore(false);
        setLoadingMessages(false);
        shouldScrollToBottomRef.current = false;
    };

    const fetchChatList = useCallback(async () => {
        if (!userId) return;

        try {
            setLoadingChats(true);
            const res = await axios.get(`${API}/chat/list-message`, config);
            const list = extractPaginatedList(res);
            setChatList(safeArray(list));
        } catch (err) {
            console.error("fetchChatList error:", err);
            setChatList([]);
        } finally {
            setLoadingChats(false);
        }
    }, [API, config, userId]);

    const fetchMessagesByChat = useCallback(
        async (chatId, targetPage = 1) => {
            const res = await axios.get(
                `${API}/chat/get-message/${chatId}?page=${targetPage}&size=${size}`,
                config
            );

            const messageListDesc = extractPaginatedList(res);
            const pagination = extractPaginationMeta(res);

            return {
                messages: normalizeDescMessages(messageListDesc),
                rawLength: safeArray(messageListDesc).length,
                pagination,
            };
        },
        [API, config, size]
    );

    const openChatAndScrollToBottom = useCallback(
        async (chatId) => {
            if (!chatId) return;

            try {
                setActiveChat(chatId);
                lastOpenedChatRef.current = chatId;

                setMessages([]);
                setContent("");
                setPage(1);
                setHasMore(true);
                setLoadingMore(false);
                setLoadingMessages(true);

                const { messages: firstMessages, rawLength, pagination } =
                    await fetchMessagesByChat(chatId, 1);

                setMessages(firstMessages);

                if (rawLength < size || 1 >= (pagination.totalPages || 1)) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                await markAsReadByChatId(chatId);

                shouldScrollToBottomRef.current = true;

                setTimeout(() => {
                    scrollToBottom(false);
                }, 0);
            } catch (err) {
                console.error("openChatAndScrollToBottom error:", err);
                setMessages([]);
                setHasMore(false);
            } finally {
                setLoadingMessages(false);
            }
        },
        [fetchMessagesByChat, markAsReadByChatId, scrollToBottom, size]
    );

    const handleToggleWidget = async () => {
        if (isOpen) {
            setIsOpen(false);
            resetChatState({ keepLastChat: true });
            return;
        }

        setIsOpen(true);

        if (lastOpenedChatRef.current) {
            await openChatAndScrollToBottom(lastOpenedChatRef.current);
        }
    };

    const handleCloseChat = () => {
        setIsOpen(false);
        resetChatState({ keepLastChat: true });
    };

    useEffect(() => {
        fetchChatList();
    }, [fetchChatList]);

    useEffect(() => {
        if (!userId) return;
        socket.emit("join_user", userId);
    }, [userId]);

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
            if (!data?.message_id) return;
            if (!isSameId(data.message_id, activeChat)) return;

            shouldScrollToBottomRef.current = true;
            setMessages((prev) => mergeUniqueMessages(prev, [data], "append"));
            updateChatPreview(data);
        };

        socket.off("receive_message", handleIncoming);
        socket.on("receive_message", handleIncoming);

        return () => {
            socket.off("receive_message", handleIncoming);
            socket.off("connect", joinRoom);
        };
    }, [activeChat, isOpen, updateChatPreview]);

    useEffect(() => {
        if (!userId) return;

        const handler = (data) => {
            if (!data?.message_id) return;

            updateChatPreview(data);
            incrementUnreadIfNeeded(data);
        };

        socket.off("new_message_notification", handler);
        socket.on("new_message_notification", handler);

        return () => {
            socket.off("new_message_notification", handler);
        };
    }, [userId, updateChatPreview, incrementUnreadIfNeeded]);

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

            const olderMessagesDesc = extractPaginatedList(res);
            const olderMessages = normalizeDescMessages(olderMessagesDesc);
            const pagination = extractPaginationMeta(res);

            if (olderMessages.length === 0) {
                setHasMore(false);
                return;
            }

            setMessages((prev) => mergeUniqueMessages(prev, olderMessages, "prepend"));
            setPage(nextPage);

            if (
                olderMessagesDesc.length < size ||
                nextPage >= (pagination.totalPages || 1)
            ) {
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

    const handleSelectChat = async (chatId) => {
        setIsOpen(true);
        await openChatAndScrollToBottom(chatId);
    };

    const handleFocusMessageInput = async () => {
        if (!activeChat) return;

        await markAsReadByChatId(activeChat);
        shouldScrollToBottomRef.current = true;

        setTimeout(() => {
            scrollToBottom(false);
        }, 50);
    };

    useEffect(() => {
        if (!isOpen || !activeChat) return;
        if (!shouldScrollToBottomRef.current) return;

        scrollToBottom(false);
        shouldScrollToBottomRef.current = false;
    }, [messages, isOpen, activeChat, scrollToBottom]);

    const handleSend = async () => {
        const trimmed = content.trim();
        if (!trimmed || !activeChat) return;

        try {
            const res = await axios.post(
                `${API}/chat/send`,
                {
                    message_id: activeChat,
                    content: trimmed,
                },
                config
            );

            const newMessage =
                res?.data?.data && typeof res.data.data === "object"
                    ? res.data.data
                    : null;

            if (newMessage) {
                shouldScrollToBottomRef.current = true;
                setMessages((prev) => mergeUniqueMessages(prev, [newMessage], "append"));
                updateChatPreview(newMessage);
            }

            setContent("");
        } catch (err) {
            console.error("handleSend error:", err);
        }
    };

    const handleKeyDownMessage = async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            await handleSend();
        }
    };

    const filteredChatList = safeArray(chatList).filter((chat) =>
        String(chat?.other_user_name || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const totalUnread = safeArray(chatList).reduce(
        (sum, chat) => sum + Number(chat?.other_unread_count || 0),
        0
    );

    const activeChatInfo = safeArray(chatList).find((c) =>
        isSameId(c.id, activeChat)
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
                            {loadingChats ? (
                                <div className="p-3 text-xs text-gray-500">
                                    Đang tải danh sách chat...
                                </div>
                            ) : filteredChatList.length === 0 ? (
                                <div className="p-3 text-xs text-gray-500">
                                    Không có cuộc trò chuyện nào
                                </div>
                            ) : (
                                filteredChatList.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => handleSelectChat(chat.id)}
                                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-200 ${
                                            isSameId(activeChat, chat.id) ? "bg-gray-300" : ""
                                        }`}
                                    >
                                        <img
                                            src={`https://i.pravatar.cc/40?u=${chat.other_user_id}`}
                                            className="w-8 h-8 rounded-full"
                                            alt={chat.other_user_name || "avatar"}
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium truncate">
                                                {chat.other_user_name || "Người dùng"}
                                            </div>
                                            {chat.last_message && (
                                                <div className="text-[11px] text-gray-500 truncate">
                                                    {chat.last_message}
                                                </div>
                                            )}
                                        </div>

                                        {Number(chat.other_unread_count || 0) > 0 && (
                                            <div className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                                                {chat.other_unread_count}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="p-3 border-b flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                                {activeChatInfo?.other_user_name || "Chat"}
                            </span>

                            <button onClick={handleCloseChat} className="ml-auto">
                                ✖
                            </button>
                        </div>

                        <div
                            ref={messageBoxRef}
                            onScroll={handleScrollMessages}
                            className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-100 text-sm"
                        >
                            {loadingMessages && (
                                <div className="text-center text-xs text-gray-500">
                                    Đang tải tin nhắn...
                                </div>
                            )}

                            {loadingMore && (
                                <div className="text-center text-xs text-gray-500">
                                    Đang tải thêm...
                                </div>
                            )}

                            {!loadingMessages && activeChat && messages.length === 0 && (
                                <div className="text-center text-xs text-gray-500">
                                    Chưa có tin nhắn nào
                                </div>
                            )}

                            {messages.map((msg) => {
                                const isMe = isSameId(msg.user_id, userId);

                                return isMe ? (
                                    <div key={msg.id} className="flex justify-end">
                                        <div className="bg-green-500 text-white px-3 py-2 rounded-xl max-w-[70%] break-words">
                                            {msg.content}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={msg.id} className="flex items-end gap-2">
                                        <img
                                            src={`https://i.pravatar.cc/30?u=${msg.user_id}`}
                                            className="w-6 h-6 rounded-full"
                                            alt="avatar"
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
                                    className="bg-green-500 text-white px-4 rounded-full disabled:opacity-50"
                                    disabled={!content.trim()}
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