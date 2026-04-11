import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Logo from "../assets/Logo.svg";
import { toast } from "sonner";
import { Loading } from "../components/Layout/Loading";

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const handChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        if (form.email === "" && form.password == "") {
            return toast.warning("Vui lòng nhập email và mật khẩu!");
        }
        if (form.email === "") {
            return toast.warning("Vui long nhập Email!");
        }
        if (form.password === "") {
            return toast.warning("Vui lòng nhập mật khẩu!");
        }

        try {
            setLoading(true);
            const clearnForm = {
                email: form.email.trim(),
                password: form.password,
            }

            const res = await axios.post("https://system-waste-less-ai.onrender.com/api/auth/login",
                clearnForm
            );
            const token = res.data.data;
            console.log(token);
            localStorage.setItem("token", token);
            const decode = jwtDecode(token);
            console.log(decode);

            toast.success("Đăng nhập thành công!");

            if (decode.role == "Manager") {
                navigate("/app");
            } else if (decode.role == "Kitchen") {
                navigate("/kitchen");
            } else if (decode.role == "Admin") {
                navigate("/admin/dashboard");
            }
        } catch (error) {
            console.log("lỗi", error);
            // const message = error.response?.data?.message || "Đăng nhập thất bại";
            toast.error("Email hoặc mật khẩu không đúng!");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {loading && <Loading/>}
            <form className="min-h-screen bg-gray-100">
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
                        Chưa có tài khoản?{" "}
                        <Link
                            to="/register"
                            className="text-green-600 font-medium hover:underline"
                        >
                            Đăng ký
                        </Link>
                    </p>
                </div>
                {/* Center Form */}
                <div className="flex justify-center items-center h-[80vh] px-4">
                    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Chào mừng trở lại
                        </h1>
                        <p className="text-gray-500 mb-6">
                            Vui lòng đăng nhập vào tài khoản của bạn để tiếp tục.
                        </p>
                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">
                                Email hoặc Mã nhân viên
                            </label>
                            <input
                                type="text"
                                name="email"
                                value={form.email}
                                onChange={handChange}
                                placeholder="user@company.com hoặc NV-001"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                        </div>
                        {/* Password */}
                        <div className="mb-4 relative">
                            <label className="block text-sm text-gray-600 mb-1">
                                Mật khẩu
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            {/* Toggle */}
                            <span
                                className="absolute right-3 top-9 cursor-pointer text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                👁
                            </span>
                        </div>
                        {/* Options */}
                        <div className="flex items-center justify-between mb-6">
                            <label className="flex items-center text-sm text-gray-600">
                                <input type="checkbox" className="mr-2" />
                                Ghi nhớ tôi
                            </label>
                            <a
                                href="#"
                                className="text-sm text-green-600 hover:underline"
                            >
                                Quên mật khẩu?
                            </a>
                        </div>
                        {/* Button */}
                        <button
                            onClick={handleLogin}
                            onKeyDown={(e) => {
                                if (e.key == "enter") {
                                    handleLogin(e)
                                }
                            }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </div>
            </form>
            );
        </>

    )
}

export default Login;
