import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm }) => {
    // ESC để đóng
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-[400px] p-6 z-10">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Xác nhận đăng xuất
                </h2>

                <p className="text-gray-600 mb-6">
                    Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmLogoutModal;