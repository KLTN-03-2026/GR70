import React from "react";
import { Outlet } from "react-router-dom";
import KitchenSidebar from "./KitchenSidebar";
import ChatWidget from "../ChatWidget"; // Đảm bảo đường dẫn import chính xác
import { jwtDecode } from "jwt-decode";

const KitchenLayout = () => {
    const token = localStorage.getItem("token");
    const decode = jwtDecode(token);
    const userID = decode.userId;
    return (
        <div className="flex h-screen bg-white">
            <KitchenSidebar />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>

            {/* Hiển thị chat cho tất cả các trang thuộc phân hệ Kitchen */}
            <ChatWidget userId={userID}/>
        </div>
    );
};

export default KitchenLayout;