import React, { useState } from "react";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        name: "Trần Hoàng Nam",
        email: "nam@mail.com",
        phone: "0901 234 567",
        joinDate: "27/03/2023",
        role: "Nhân viên bếp",
        businessType: "Nhà hàng",
        address: "123 Lê Lợi, Quận 1",
        province: "TP. Hồ Chí Minh",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = () => {
        console.log("DATA UPDATE:", form);
        alert("Cập nhật thành công!");
        setIsEditing(false);
    };

    return (
        <div className="p-6 bg-[#F6F8FA] min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#141C21]">
                    Thông tin cá nhân
                </h1>
                <p className="text-sm text-gray-500">
                    Thông tin tài khoản trong hệ thống
                </p>
            </div>

            {/* Thông tin cơ bản */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <h3 className="font-semibold mb-4">Thông tin cơ bản</h3>

                <div className="grid grid-cols-2 gap-6 text-sm">
                    {/* Name */}
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

                    {/* Email */}
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

                    {/* Phone */}
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

                    {/* Join Date */}
                    <div>
                        <p className="text-gray-400">Ngày tham gia</p>
                        <p className="font-medium">{form.joinDate}</p>
                    </div>
                </div>
            </div>

            {/* Thông tin hệ thống (READ ONLY) */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Thông tin hệ thống</h3>

                <div className="grid grid-cols-2 gap-6 text-sm">
                    {/* Role */}
                    <div>
                        <p className="text-gray-400">Vai trò</p>
                        <p className="font-medium">{form.role}</p>
                    </div>

                    {/* Business Type */}
                    <div>
                        <p className="text-gray-400">Loại hình</p>
                        <p className="font-medium">{form.businessType}</p>
                    </div>

                    {/* Address */}
                    <div>
                        <p className="text-gray-400">Địa chỉ quán</p>
                        <p className="font-medium">{form.address} </p>
                    </div>

                    {/* Province */}
                    <div>
                        <p className="text-gray-400">Tỉnh / Thành phố</p>
                        <p className="font-medium">{form.province} </p>
                    </div>
                </div>
            </div>

            {/* Button */}
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