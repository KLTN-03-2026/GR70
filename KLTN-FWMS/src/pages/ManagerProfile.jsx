import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ManagerProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(null);
    const [error, setError] = useState("");

    // ===== GET USER INFO =====
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(
                    "https://system-waste-less-ai.onrender.com/api/users/info",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = res.data.data;

                setForm({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    joinDate: new Date(data.created_at).toLocaleDateString("vi-VN"),

                    role: data.roles?.[0]?.name || "",

                    restaurantName: data.brand?.name || "",
                    businessType: data.brand?.rolebrand || "",
                    address: data.brand?.address || "",
                    province: data.brand?.province || "",
                    status: data.brand?.status ? "Hoạt động" : "Ngừng",
                });
            } catch (err) {
                console.error(err);
                setError("Lỗi load dữ liệu");
            }
        };

        fetchUser();
    }, []);

    // ===== HANDLE CHANGE =====
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // ===== UPDATE =====
    const handleSubmit = async () => {
        try {
            setError("");
            const token = localStorage.getItem("token");

            await axios.put(
                "https://system-waste-less-ai.onrender.com/api/users/update-info",
                {
                    name: form.name,
                    email: form.email, // ✅ cho gửi luôn
                    phone: form.phone,

                    nameBrand: form.restaurantName,
                    addressBrand: form.address,
                    province: form.province,
                    rolebrand: form.businessType,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Cập nhật thành công!");
            setIsEditing(false);
        } catch (err) {
            console.error(err);

            // ===== HIỂN THỊ LỖI BACKEND =====
            if (err.response?.data?.errors) {
                setError(err.response.data.errors);
            } else {
                setError("Cập nhật thất bại!");
            }
        }
    };

    if (!form) return <div className="p-10">Loading...</div>;

    // ===== FIELD =====
    const Field = ({ label, value, name }) => (
        <div className="space-y-1">
            <p className="text-xs text-gray-400">{label}</p>

            {isEditing && name ? (
                <input
                    name={name}
                    value={value}
                    onChange={handleChange}
                    className="w-full border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 p-2 rounded-lg outline-none"
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
                <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
                <p className="text-sm text-gray-500">
                    Thông tin tài khoản quản lý hệ thống
                </p>
            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* BASIC */}
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
                <h2 className="font-semibold text-lg mb-4">
                    Thông tin cơ bản
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Họ tên" value={form.name} name="name" />

                    {/* ✅ EMAIL CHO EDIT */}
                    <Field label="Email" value={form.email} name="email" />

                    <Field label="SĐT" value={form.phone} name="phone" />
                    <Field label="Ngày tham gia" value={form.joinDate} />
                </div>
            </div>

            {/* SYSTEM */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-lg mb-4">
                    Thông tin hệ thống
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Vai trò" value={form.role} />

                    <Field
                        label="Tên nhà hàng"
                        value={form.restaurantName}
                        name="restaurantName"
                    />

                    <Field
                        label="Loại hình"
                        value={form.businessType}
                        name="businessType"
                    />

                    <Field
                        label="Địa chỉ"
                        value={form.address}
                        name="address"
                    />

                    <Field
                        label="Tỉnh / Thành phố"
                        value={form.province}
                        name="province"
                    />

                    <Field label="Trạng thái" value={form.status} />
                </div>
            </div>

            {/* BUTTON */}
            <div className="flex justify-end mt-6 gap-3">
                {isEditing && (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-500"
                    >
                        Hủy
                    </button>
                )}

                <button
                    onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                >
                    {isEditing ? "Lưu thay đổi" : "Cập nhật thông tin"}
                </button>
            </div>
        </div>
    );
}