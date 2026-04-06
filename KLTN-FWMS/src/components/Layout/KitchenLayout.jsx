import React from "react";
import { Outlet } from "react-router-dom";
import KitchenSidebar from "./KitchenSidebar";
import ChatWidget from "../ChatWidget"; // Đảm bảo đường dẫn import chính xác

const KitchenLayout = () => {
    return (
        <div className="flex h-screen bg-white">
            <KitchenSidebar />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
            
            {/* Hiển thị chat cho tất cả các trang thuộc phân hệ Kitchen */}
            <ChatWidget />
        </div>
    );
};

export default KitchenLayout;