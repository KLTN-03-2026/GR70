import React, { useState, useEffect } from "react";
import axios from "axios";

// ===== FIELD COMPONENT =====
const Field = ({
    label,
    value,
    name,
    isEditing,
    handleChange,
}) => (
    <div className="space-y-1">
        <p className="text-xs text-gray-400">{label}</p>

        {isEditing && name ? (
            <input
                type="text"
                name={name}
                value={value}
                onChange={handleChange}
                className="w-full border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 p-2 rounded-lg outline-none"
            />
        ) : (
            <p className="font-semibold text-[#141C21]">
                {value || "-"}
            </p>
        )}
    </div>
);

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
                    joinDate: data.created_at
                        ? new Date(data.created_at).toLocaleDateString("vi-VN")
                        : "",

                    role: data.roles?.[0]?.name || "",

                    restaurantName: data.brand?.name || "",
                    businessType: data.brand?.rolebrand || "",
                    address: data.brand?.address || "",
                    province: data.brand?.province || "",
                    status: data.brand?.status
                        ? "Hoạt động"
                        : "Ngừng",
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
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ===== UPDATE =====
    const handleSubmit = async () => {
        try {
            setError("");

            // ===== VALIDATE =====

            // Không được bỏ trống
            if (
                !form.name.trim() ||
                !form.email.trim() ||
                !form.restaurantName.trim() ||
                !form.businessType.trim() ||
                !form.address.trim() ||
                !form.province.trim()
            ) {
                setError("Vui lòng nhập đầy đủ thông tin!");
                return;
            }

            // ===== VALIDATE EMAIL =====
            const emailRegex =
                /^[A-Za-z0-9._%+-]+@gmail\.com$/;

            if (!emailRegex.test(form.email)) {
                setError("Email không đúng định dạng!");
                return;
            }

            // ===== PHONE =====
            // Được phép bỏ trống
            // Nếu nhập thì phải đúng định dạng
            if (form.phone.trim() !== "") {
                const phoneRegex = /^[0-9]{9,11}$/;

                if (!phoneRegex.test(form.phone)) {
                    setError("Số điện thoại không hợp lệ!");
                    return;
                }
            }

            const token = localStorage.getItem("token");

            await axios.put(
                "https://system-waste-less-ai.onrender.com/api/users/update-info",
                {
                    name: form.name,
                    email: form.email,
                    ...(form.phone.trim() !== "" && {
                        phone: form.phone,
                    }),

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

            if (err.response?.data?.errors) {
                if (Array.isArray(err.response.data.errors)) {
                    setError(err.response.data.errors.join(", "));
                } else {
                    setError(err.response.data.errors);
                }
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Cập nhật thất bại!");
            }
        }
    };

    // ===== LOADING =====
    if (!form) {
        return (
            <div className="p-10 text-gray-500">
                Loading...
            </div>
        );
    }

    return (
        <div className="p-10 bg-[#F4F6F8] min-h-screen">
            {/* ===== TITLE ===== */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Thông tin cá nhân
                </h1>

                <p className="text-sm text-gray-500">
                    Thông tin tài khoản quản lý hệ thống
                </p>
            </div>

            {/* ===== ERROR ===== */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* ===== BASIC INFO ===== */}
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
                <h2 className="font-semibold text-lg mb-4">
                    Thông tin cơ bản
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                        label="Họ tên"
                        value={form.name}
                        name="name"
                        isEditing={isEditing}
                        handleChange={handleChange}
                    />

                    <Field
                        label="Email"
                        value={form.email}
                        name="email"
                        isEditing={isEditing}
                        handleChange={handleChange}
                    />

                    <Field
                        label="SĐT"
                        value={form.phone}
                        name="phone"
                        isEditing={isEditing}
                        handleChange={handleChange}
                    />

                    <Field
                        label="Ngày tham gia"
                        value={form.joinDate}
                    />
                </div>
            </div>

            {/* ===== SYSTEM INFO ===== */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-lg mb-4">
                    Thông tin hệ thống
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                        label="Vai trò"
                        value={form.role}
                    />

                    <Field
                        label="Tên nhà hàng"
                        value={form.restaurantName}
                        name="restaurantName"
                        isEditing={isEditing}
                        handleChange={handleChange}
                    />

                    <Field
                        label="Loại hình"
                        value={form.businessType}
                        name="businessType"
                        isEditing={isEditing}
                        handleChange={handleChange}
                    />

                    <Field
                        label="Địa chỉ"
                        value={form.address}
                        name="address"
                        isEditing={isEditing}
                        handleChange={handleChange}
                    />

                    <Field
                        label="Tỉnh / Thành phố"
                        value={form.province}
                        name="province"
                        isEditing={isEditing}
                        handleChange={handleChange}
                    />

                    <Field
                        label="Trạng thái"
                        value={form.status}
                    />
                </div>
            </div>

            {/* ===== BUTTON ===== */}
            <div className="flex justify-end mt-6 gap-3">
                {isEditing && (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-500 hover:text-black"
                    >
                        Hủy
                    </button>
                )}

                <button
                    onClick={
                        isEditing
                            ? handleSubmit
                            : () => setIsEditing(true)
                    }
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
                >
                    {isEditing
                        ? "Lưu thay đổi"
                        : "Cập nhật thông tin"}
                </button>
            </div>
        </div>
    );
}

