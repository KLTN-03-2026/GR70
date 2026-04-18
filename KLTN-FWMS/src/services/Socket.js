import { io } from "socket.io-client";

const socket = io("https://system-waste-less-ai.onrender.com", {
    transports: ["websocket"],
    autoConnect: true,
});

export default socket;