import { useState, useRef, useEffect } from "react";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 300 });

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const currentUserId = 1;
    const currentMessageId = 1;

    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const bottomRef = useRef(null);

    // ================= DRAG =================
    const handleMouseDown = (e) => {
        dragging.current = true;
        offset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleMouseMove = (e) => {
        if (!dragging.current) return;
        setPosition({
            x: e.clientX - offset.current.x,
            y: e.clientY - offset.current.y,
        });
    };

    const handleMouseUp = () => {
        dragging.current = false;
    };

    // ================= LOAD MESSAGE =================
    useEffect(() => {
        fetch(`http://localhost:5173/KLTN-FWMS/Detail_message?message_id=${currentMessageId}`)
            .then((res) => res.json())
            .then((data) => setMessages(data));
    }, []);

    // ================= AUTO SCROLL =================
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ================= SEND =================
    const handleSend = async () => {
        if (!input.trim()) return;

        const newMsg = {
            message_id: currentMessageId,
            user_id: currentUserId,
            content: input,
            status: "sent",
            createAt: new Date().toISOString(),
        };

        await fetch("http://localhost:5173/KLTN-FWMS/Detail_message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newMsg),
        });

        setMessages((prev) => [...prev, { ...newMsg, id: Date.now() }]);
        setInput("");
    };

    return (
        <>
            {/* CHAT ICON */}
            <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    left: position.x,
                    top: position.y,
                    cursor: "pointer",
                    zIndex: 9999,
                }}
            >
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <div className="w-8 h-6 bg-white rounded-md relative">
                        <div className="absolute top-1 left-1 w-5 h-1 bg-green-500 rounded"></div>
                        <div className="absolute top-3 left-1 w-4 h-1 bg-green-500 rounded"></div>
                    </div>
                </div>
            </div>

            {/* POPUP */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[500px] h-[600px] bg-white rounded-2xl shadow-2xl flex z-50 overflow-hidden">
                    
                    {/* SIDEBAR */}
                    <div className="w-[180px] bg-gray-50 border-r flex flex-col">
                        <div className="p-3">
                            <input
                                placeholder="Tìm..."
                                className="w-full px-3 py-2 text-sm rounded-full bg-gray-200"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {[
                                { name: "Lê Thị Mai", role: "Admin" },
                                { name: "Trần Hoàng Nam", role: "Manager" },
                                { name: "Bếp Trưởng Toàn", role: "Kitchen" },
                            ].map((u, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 cursor-pointer"
                                >
                                    <img
                                        src={`https://i.pravatar.cc/40?img=${i + 1}`}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                        <div className="text-xs font-medium">{u.name}</div>
                                        <div className="text-[10px] text-green-500">
                                            {u.role}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CHAT */}
                    <div className="flex-1 flex flex-col">
                        
                        {/* HEADER */}
                        <div className="p-3 border-b flex items-center gap-2">
                            <img
                                src="https://i.pravatar.cc/40"
                                className="w-8 h-8 rounded-full"
                            />
                            <span className="font-medium text-sm">
                                Lê Thị Mai
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
                                const isMe = msg.user_id === currentUserId;

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
                        <div className="p-2 border-t flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
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
                    </div>
                </div>
            )}
        </>
    );
}