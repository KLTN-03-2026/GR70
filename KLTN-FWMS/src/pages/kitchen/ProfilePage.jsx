import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(null);
    const [error, setError] = useState("");

    // ===== GET USER =====
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
                    businessType: data.brand?.rolebrand || "",
                    address: data.brand?.address || "",
                    province: data.brand?.province || "",
                });
            } catch (err) {
                console.error(err);
                setError("Lỗi tải dữ liệu");
            }
        };

        fetchUser();
    }, []);

    // ===== CHANGE =====
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
                    email: form.email, // có thể lỗi duplicate
                    phone: form.phone,
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

            if (err.response?.data?.errors) {
                setError(err.response.data.errors);
            } else {
                setError("Cập nhật thất bại!");
            }
        }
    };

    if (!form) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 bg-[#F6F8FA] min-h-screen">
            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#141C21]">
                    Thông tin cá nhân
                </h1>
                <p className="text-sm text-gray-500">
                    Thông tin tài khoản trong hệ thống
                </p>
            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
                    {error}
                </div>
            )}

            {/* BASIC */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <h3 className="font-semibold mb-4">Thông tin cơ bản</h3>

                <div className="grid grid-cols-2 gap-6 text-sm">
                    {/* NAME */}
                    <div>
                        <p className="text-gray-400">Họ tên</p>
                        {isEditing ? (
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        ) : (
                            <p className="font-medium">{form.name}</p>
                        )}
                    </div>

                    {/* EMAIL */}
                    <div>
                        <p className="text-gray-400">Email</p>
                        {isEditing ? (
                            <input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        ) : (
                            <p className="font-medium">{form.email}</p>
                        )}
                    </div>

                    {/* PHONE */}
                    <div>
                        <p className="text-gray-400">Số điện thoại</p>
                        {isEditing ? (
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        ) : (
                            <p className="font-medium">{form.phone}</p>
                        )}
                    </div>

                    {/* JOIN DATE */}
                    <div>
                        <p className="text-gray-400">Ngày tham gia</p>
                        <p className="font-medium">{form.joinDate}</p>
                    </div>
                </div>
            </div>

            {/* SYSTEM (READ ONLY) */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Thông tin nơi làm việc</h3>

                <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                        <p className="text-gray-400">Vai trò</p>
                        <p className="font-medium">{form.role}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Loại hình</p>
                        <p className="font-medium">{form.businessType}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Địa chỉ quán</p>
                        <p className="font-medium">{form.address}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Tỉnh / Thành phố</p>
                        <p className="font-medium">{form.province}</p>
                    </div>
                </div>
            </div>

            {/* BUTTON */}
            <div className="flex justify-end mt-6 gap-3">
                {isEditing && (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm text-gray-500"
                    >
                        Hủy
                    </button>
                )}

                <button
                    onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm"
                >
                    {isEditing ? "Lưu thay đổi" : "Cập nhật thông tin"}
                </button>
            </div>
        </div>
    );
}