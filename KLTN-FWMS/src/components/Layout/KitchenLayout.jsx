import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import KitchenSidebar from "./KitchenSidebar";
import ChatWidget from "../ChatWidget";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const KitchenLayout = () => {
    const token = localStorage.getItem("token");

    const [userID, setUserID] = useState(null);
    const [lockModal, setLockModal] = useState({
        open: false,
        reason: "",
    });

    const location = useLocation();

    // decode token an toàn
    useEffect(() => {
        if (!token) return;

        try {
            const decode = jwtDecode(token);
            setUserID(decode.userId);
        } catch (err) {
            console.log("Token lỗi", err);
        }
    }, [token]);

    // check lock
    const checkLock = async () => {
        if (!userID) return;

        try {
            const res = await axios.get(
                `https://system-waste-less-ai.onrender.com/api/get-reason-lock/${userID}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("API LOCK:", res.data); // 🔥 debug

            const data = res.data.data;

            if (!data?.isLocked) {
                setLockModal({
                    open: true,
                    reason: data.reason || "Không có lý do"
                });
            }

        } catch (err) {
            console.log("Lỗi check lock:", err.response || err);
        }
    };

    // chạy lần đầu
    useEffect(() => {
        checkLock();
    }, [userID]);

    // đổi trang
    useEffect(() => {
        checkLock();
    }, [location.pathname]);

    // polling
    useEffect(() => {
        const interval = setInterval(() => {
            checkLock();
        }, 60000);

        return () => clearInterval(interval);
    }, [userID]);

    return (
        <>
            {/* MODAL */}
            {lockModal.open && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white w-[420px] p-6 rounded-2xl shadow-xl text-center animate-fadeIn">

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full text-4xl">
                                ⚠️
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Tài khoản đã bị khóa
                        </h2>

                        {/* Subtitle */}
                        <p className="text-red-400 italic text-sm mb-4">
                            Vui lòng liên hệ quản lý để được hỗ trợ mở lại tài khoản.
                        </p>

                        {/* Reason */}
                        <div className="text-left mb-5">
                            <p className="text-sm text-gray-400 mb-1">Lý do khóa tài khoản</p>
                            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-700">
                                {lockModal.reason || "Không có thông tin cụ thể"}
                            </div>
                        </div>

                        

                        {/* Button */}
                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                window.location.href = "/login";
                            }}
                            className="w-full bg-red-500 hover:bg-red-600 transition text-white py-2.5 rounded-lg font-medium"
                        >
                            Đăng nhập lại
                        </button>
                    </div>
                </div>
            )}
            {/* MAIN */}
            <div className="flex h-screen bg-white">
                <KitchenSidebar />
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>

                <ChatWidget userId={userID} />
            </div>
        </>
    );
};

export default KitchenLayout;