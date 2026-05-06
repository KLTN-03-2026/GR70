import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/Logo.svg";
import { toast } from "sonner";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        province: "",
        businessType: "",
        nameBrand: "",
        addressBrand: "",
    });
    const provinces = [
        "An Giang",
        "Bắc Ninh",
        "Cà Mau",
        "Cao Bằng",
        "Cần Thơ",
        "Đà Nẵng",
        "Đắk Lắk",
        "Điện Biên",
        "Đồng Nai",
        "Đồng Tháp",
        "Gia Lai",
        "Hà Nội",
        "Hà Tĩnh",
        "Hải Phòng",
        "Hồ Chí Minh",
        "Hưng Yên",
        "Huế",
        "Khánh Hòa",
        "Lâm Đồng",
        "Lai Châu",
        "Lạng Sơn",
        "Lào Cai",
        "Nghệ An",
        "Ninh Bình",
        "Phú Thọ",
        "Quảng Ngãi",
        "Quảng Ninh",
        "Quảng Trị",
        "Sơn La",
        "Tây Ninh",
        "Thái Nguyên",
        "Thanh Hóa",
        "Tuyên Quang",
        "Vĩnh Long",

    ];

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!form.name.trim()) {
            return toast.error("Vui lòng nhập họ và tên");
        }
        if (!form.email.trim()) {
            return toast.error("Vui lòng nhập email");
        }
        if (!form.email.endsWith("@gmail.com")) {
            return toast.error("Email không hợp lệ!");
        }
        if (!form.password.trim()) {
            return toast.error("Vui lòng nhập mật khẩu");
        }
        if (form.password.length < 6 || form.password.length > 18) {
            return toast.error("Mật khẩu phải từ 6 đến 18 ký tự!");
        }
        if (!/[A-Z]/.test(form.password)) {
            return toast.error("Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)!");
        }
        if (!/[a-z]/.test(form.password)) {
            return toast.error("Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)!");
        }
        if (!/[0-9]/.test(form.password)) {
            return toast.error("Mật khẩu phải chứa ít nhất 1 chữ số (0-9)!");
        }
        if (!/[@$!%*?&]/.test(form.password)) {
            return toast.error("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, $, !, %, *, ?, &)");
        }
        if (!form.address.trim()) {
            return toast.error("Vui lòng nhập địa chỉ");
        }
        if (!form.businessType) {
            return toast.error("Vui lòng chọn loại hình");
        }
        if (!form.nameBrand.trim()) {
            return toast.error("Vui lòng nhập tên nhà hàng / khách sạn");
        }
        if (!form.province) {
            return toast.error("Vui lòng chọn tỉnh / thành phố");
        }
        if (!form.addressBrand.trim()) {
            return toast.error("Vui lòng nhập địa chỉ cơ sở");
        }

        try {
            const res = await axios.post(
                "https://system-waste-less-ai.onrender.com/api/auth/register",
                form
            );
            toast.success("Đăng ký thành công");
            // chuyển trang sau 1 chút
            navigate("/#/");
        } catch (error) {
            const message =
                error.response?.data?.message || "Email này đã có người đăng ký";
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2 bg-white shadow-sm">
                <div className="flex justify-between items-center px-4 py-2 bg-white shadow-sm">
                    <h1 className="flex items-center gap-2 font-semibold text-lg text-green-600">
                        <img
                            src={Logo}
                            alt="logo"
                            className="w-6 h-6 object-contain"
                        />
                        FWMS
                    </h1>
                </div>

                <p className="text-sm text-gray-500">
                    Đã có tài khoản?{" "}
                    <Link to="/" className="text-green-600 font-medium hover:underline">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>

            {/* Background */}
            <div className="relative h-56">
                <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuDa1r5p50EHorOhlEa4-vTQ5IvgtfrbGHam2exNGCeifhLrvuHtkOPqdzoVIaW911WrysjV_XE9q2k4l3VcHesNAmuKQsRu8KI17NElGXvKNLRzCbWyvFeWg9wjDsd-HqytN1N5QYt_aAMhFjT3FSGCijzliFIojkDRqKxGr74dFbENbFsPKCk_WB7-Os6EA7dynW5tcsQQQkrsu0ghlZYua56wO9_1H4SgMzFHN93aYRqZ54Oedkgx0x7M-N5YZe30DMJ3IEh2C974')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-white/70"></div>
            </div>

            {/* Form */}
            <div className="relative z-10 flex justify-center -mt-24 px-4 pb-24">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl"
                >
                    <h2 className="text-xl font-bold mb-2">
                        Đăng ký tài khoản quản lý
                    </h2>

                    <p className="text-gray-500 mb-6 text-sm">
                        Vui lòng điền đầy đủ thông tin bên dưới để bắt đầu tối ưu hóa thực phẩm.
                    </p>

                    {/* Thông tin cá nhân */}
                    <h3 className="font-semibold mb-3 text-green-600">
                        Thông tin cá nhân
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        <input
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="email@vi-du.com"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>

                    {/* Thông tin nhà hàng */}
                    <h3 className="font-semibold mb-3 text-green-600">
                        Thông tin nhà hàng - khách sạn
                    </h3>
                    <select
                        name="businessType"
                        value={form.businessType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
                    >
                        <option value="">Chọn loại hình</option>
                        <option value="restaurant">Nhà hàng</option>
                        <option value="hotel">Khách sạn</option>
                    </select>


                    <div className="space-y-4 mb-6">

                        <input
                            name="nameBrand"
                            value={form.nameBrand}
                            onChange={handleChange}
                            placeholder="Nhập tên nhà hàng hoặc khách sạn"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        <select
                            name="province"
                            value={form.province}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                            <option value="">Chọn tỉnh / thành phố</option>
                            {provinces.map((p, index) => (
                                <option key={index} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                        <input
                            name="addressBrand"
                            value={form.addressBrand}
                            onChange={handleChange}
                            placeholder="Số nhà, tên đường, quận/huyện, thành phố"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                    >
                        Xác nhận đăng ký
                    </button>

                    {/* Footer */}
                    <p className="text-center text-sm mt-4">
                        Quay lại trang{" "}
                        <Link to="/" className="text-green-600">
                            Đăng nhập
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;