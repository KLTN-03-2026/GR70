import React, { useState } from "react";

export default function ManagerProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        name: "Nguyễn Văn A",
        email: "manager@mail.com",
        phone: "0909 888 999",
        joinDate: "15/01/2022",
        role: "Quản lý",
        restaurantName: "Nhà hàng Biển Xanh",
        storeCode: "NH001",
        businessType: "Nhà hàng",
        address: "456 Trần Hưng Đạo, Quận 1",
        province: "TP. Hồ Chí Minh",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = () => {
        console.log("UPDATE:", form);
        alert("Cập nhật thành công!");
        setIsEditing(false);
    };

    const Field = ({ label, value, name }) => (
        <div className="space-y-1">
            <p className="text-xs text-gray-400">{label}</p>
            {isEditing && name ? (
                <input
                    name={name}
                    value={value}
                    onChange={handleChange}
                    className="w-full border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 p-2 rounded-lg outline-none transition"
                />
            ) : (
                <p className="font-semibold text-[#141C21]">{value}</p>
            )}
        </div>
    );

    return (
        <div className="p-10 bg-[#F4F6F8] min-h-screen">
            {/* TITLE */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#141C21]">
                    Thông tin cá nhân
                </h1>
                <p className="text-sm text-gray-500">
                    Thông tin tài khoản quản lý hệ thống
                </p>
            </div>

            {/* ===== THÔNG TIN CƠ BẢN ===== */}
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
                <h2 className="font-semibold text-lg mb-4">
                    Thông tin cơ bản
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Họ tên" value={form.name} name="name" />
                    <Field label="Email" value={form.email} name="email" />
                    <Field label="Số điện thoại" value={form.phone} name="phone" />
                    <Field label="Ngày tham gia" value={form.joinDate} />
                </div>
            </div>

            {/* ===== THÔNG TIN QUẢN LÝ ===== */}
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
                <h2 className="font-semibold text-lg mb-4">
                    Thông tin quản lý
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                        label="Tên nhà hàng"
                        value={form.restaurantName }
                    />
                    <Field
                        label="Mã cửa hàng"
                        value={form.storeCode }
                    />
                </div>
            </div>

            {/* ===== THÔNG TIN HỆ THỐNG ===== */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-lg mb-4">
                    Thông tin hệ thống
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Vai trò" value={form.role } />
                    <Field label="Loại hình" value={form.businessType } />
                    <Field label="Địa chỉ" value={form.address } />
                    <Field label="Tỉnh / Thành phố" value={form.province} />
                </div>
            </div>

            {/* ===== BUTTON ===== */}
            <div className="flex justify-end mt-6 gap-3">
                {isEditing && (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-500 hover:text-black text-sm"
                    >
                        Hủy
                    </button>
                )}

                <button
                    onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg shadow-sm text-sm"
                >
                    {isEditing ? "Lưu thay đổi" : "Cập nhật thông tin"}
                </button>
            </div>
        </div>
    );
}