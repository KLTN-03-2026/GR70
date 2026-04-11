import React, { useState } from "react";
import { Row_Account_Staff } from "../components/Child/Row_Account_Staff";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

const Manager_Account_Staff = () => {
    const [openform_addkitchen, setopenform_setkitchen] = useState(null);
    const [visibility_password, setVisibility_password] = useState(null);
    const [formaddkitchen, setFormaddkitchen] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        address: "",
    });
    const token = localStorage.getItem("token");
    const decode = jwtDecode(token);
    console.log(decode);
    console.log(decode);

    const userID = decode.userId;
    const brandID = decode.brandID;
    // console.log("brandID", brandID);


    const handleChange = (e) => {
        setFormaddkitchen({
            ...formaddkitchen,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formaddkitchen.name === "") return toast.error("Username không được để trống!");
        if (formaddkitchen.name.length <= 1) return toast.error("Vui lòng nhập tên đầy đủ!");
        // test email
        if (formaddkitchen.email === "") {
           return toast.error("Email không được để trống!")
        } else if (!formaddkitchen.email.endsWith("@gmail.com"))
            return toast.error("Email không hợp lệ!");
        if (formaddkitchen.phone === "") return toast.error("Số điện thoại không được để trống!");
        if (!/[0-9]/.test(formaddkitchen.phone)) return toast.error("Số điện thoại không đúng định dạng");
        if (formaddkitchen.phone.length < 10 || formaddkitchen.phone.length > 10 ) return toast.error("Số điện thoại không đúng");
        if (formaddkitchen.address === "") return toast.error("Địa chỉ không được để trống!");
        if (formaddkitchen.address.length <= 2) return toast.error("Vui lòng nhập địa chỉ cụ thể!");
        //test password
        if (formaddkitchen.password === "") return toast.error("Mật khẩu không được để trống!");
        if (formaddkitchen.password.length < 6 || formaddkitchen.password.length > 18) {
            return toast.error("Mật khẩu phải từ 6 đến 18 ký tự!");
        }
        if (!/[A-Z]/.test(formaddkitchen.password)) {
            return toast.error("Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)!");
        }
        if (!/[a-z]/.test(formaddkitchen.password)) {
            return toast.error("Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)!");
        }
        if (!/[0-9]/.test(formaddkitchen.password)) {
            return toast.error("Mật khẩu phải chứa ít nhất 1 chữ số (0-9)!");
        }
        if (!/[@$!%*?&]/.test(formaddkitchen.password)) {
            return toast.error("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, $, !, %, *, ?, &)");
        }
        if (formaddkitchen.password.length <= 5) return toast.error("Mật khẩu của bạn quá ngắn!");
        try {
            const res = await axios.post(
                `https://system-waste-less-ai.onrender.com/api/users/register-kitchen/${userID}`,
                formaddkitchen,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                }
            );
            console.log(res.data);
            toast.success("Tạo tài khoản thành công!");
            window.location.reload();
            setopenform_setkitchen(false);
        } catch (error) {
            console.log(error.response?.data);
            toast.warning("Email này đã được đăng ký!");
        }
    };
    return (
        <div>
            <meta charSet="utf-8" />
            <meta
                content="width=device-width, initial-scale=1.0"
                name="viewport"
            />
            <title>Quản lý tài khoản nhân viên</title>
            <link
                href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&family=Nunito:wght@400;600;700&family=Public+Sans:wght@400;500;600;700;900&display=swap"
                rel="stylesheet"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap"
                rel="stylesheet"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                rel="stylesheet"
            />
            <style
                dangerouslySetInnerHTML={{
                    __html: "\n        body { font-family: 'Nunito', sans-serif; }\n        h1, h2, h3, h4 { font-family: 'Arimo', sans-serif; }\n        .material-symbols-outlined {\n            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;\n        }\n    ",
                }}
            />
            <div className="flex min-h-screen pl-8">
                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
                        <div className="flex items-center flex-1">
                            <div className="relative max-w-md w-full">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    search
                                </span>
                                <input
                                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-sm"
                                    placeholder="Tìm kiếm tài khoản..."
                                    type="text"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative">
                                <span className="material-symbols-outlined">
                                    notifications
                                </span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white " />
                            </button>
                            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full">
                                <span className="material-symbols-outlined">
                                    help_outline
                                </span>
                            </button>
                        </div>
                    </header>

                    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
                        {/* Page Title & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                    Quản lý tài khoản nhân viên
                                </h2>
                                <p className="text-slate-500 mt-1">
                                    Danh sách tất cả nhân viên thuộc quyền quản
                                    lý của bạn
                                </p>
                            </div>
                            <button
                                onClick={() => setopenform_setkitchen(true)}
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
                            >
                                <span className="material-symbols-outlined">
                                    person_add
                                </span>
                                Thêm tài khoản Kitchen
                            </button>
                        </div>

                        {/* List Kitchen Staff  */}
                        <Row_Account_Staff />
                        {/* List Kitchen Staff  */}
                    </div>
                    {/* form add kitchen */}
                    {openform_addkitchen && (
                        <div
                            div
                            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        >
                            <div className="bg-white w-full max-w-[520px] rounded-xl shadow-2xl overflow-hidden">
                                {/* Modal Header */}
                                <div className="px-8 pt-8 pb-4">
                                    <h5 className="font-arimo text-[24px] font-bold text-[#141C21] mb-1">
                                        Thêm tài khoản Bếp
                                    </h5>
                                    <p className="text-muted-text text-sm font-nunito">
                                        Tạo tài khoản mới cho nhân viên bộ phận
                                        bếp của đơn vị.
                                    </p>
                                </div>
                                {/* Modal Body / Form */}

                                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5 ">
                                    {/* Full Name */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="label-style">
                                            Họ tên
                                        </label>
                                        <input
                                            className="form-input w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 text-secondary-text focus:border-primary focus:ring-primary/20 font-nunito"
                                            placeholder="Nhập họ và tên đầy đủ"
                                            type="text"
                                            name="name"
                                            value={formaddkitchen.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {/* Email */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="label-style">
                                            Email
                                        </label>
                                        <input
                                            className="form-input w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 text-secondary-text focus:border-primary focus:ring-primary/20 font-nunito"
                                            placeholder="example@domain.com"
                                            type="email"
                                            name="email"
                                            value={formaddkitchen.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="label-style">
                                            Số điện thoại
                                        </label>
                                        <input
                                            className="form-input w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 text-secondary-text focus:border-primary focus:ring-primary/20 font-nunito"
                                            placeholder="0345651074"
                                            type="text"
                                            name="phone"
                                            value={formaddkitchen.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="label-style">
                                            Địa chỉ
                                        </label>
                                        <input
                                            className="form-input w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 text-secondary-text focus:border-primary focus:ring-primary/20 font-nunito"
                                            placeholder="129 Hoàng Minh Thảo, HKN, Liên Chiểu, Đà Nẵng"
                                            type="text"
                                            name="address"
                                            value={formaddkitchen.address}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {/* Password */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="label-style">
                                            Mật khẩu
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="form-input w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 text-secondary-text focus:border-primary focus:ring-primary/20 font-nunito pr-12"
                                                placeholder="Nhập mật khẩu"
                                                type={
                                                    visibility_password == true
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={formaddkitchen.password}
                                                onChange={handleChange}
                                            />
                                            <button
                                                onClick={() =>
                                                    setVisibility_password(!visibility_password)
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-primary transition-colors"
                                                type="button"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">
                                                    visibility
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-3 pt-4">
                                        <button
                                            onClick={() =>
                                                setopenform_setkitchen(false)
                                            }
                                            className="px-6 py-2.5 rounded-lg border border-primary/30 text-secondary-text font-nunito font-semibold hover:bg-primary/5 transition-all"
                                            type="button"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            className="px-8 py-2.5 rounded-lg bg-primary text-white font-nunito font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                                            type="submit"
                                        >
                                            Tạo tài khoản
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Manager_Account_Staff;
