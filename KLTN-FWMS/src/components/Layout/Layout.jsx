import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import ChatWidget from "../ChatWidget"; // Đảm bảo đường dẫn này đúng với project của bạn
import { jwtDecode } from "jwt-decode";

const Layout = () => {
    const token = localStorage.getItem("token");
    const decode = jwtDecode(token);
    const userID = decode.userId;console.log(userID);
    
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 ml-72 overflow-auto">
                <main className="min-h-screen bg-gray-50">
                    <Outlet />
                </main>
            </div>
            {/* Chat sẽ luôn hiện trong tất cả các route con của Layout này */}
            <ChatWidget userId={userID}/>
        </div>
    );
};

export default Layout;