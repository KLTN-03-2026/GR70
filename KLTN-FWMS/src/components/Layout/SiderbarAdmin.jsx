import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from "../../assets/Logo.svg";
import {
    LayoutDashboard,
    Users,
    UserCircle,
    Utensils,
    BarChart3,
    Brain,
    History,
    LogOut,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
export const SiderbarAdmin = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menu = [
        { name: "Bảng điều khiển", icon: "dashboard", path: "/admin/dashboard" },
        { name: "Quản lý tài khoản", icon: "user_attributes", path: "/admin/user" },
        { name: "Quản lý cửa hàng", icon: "storefront", path: "/admin/stores" },
        { name: "Thống kê hệ thống", icon: "analytics", path: "/admin/statistical" },
    ];

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r flex flex-col h-screen">
            {/* Logo */}
            <div className="px-4 py-5 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <img
                        src={logo}
                        alt="FWMS Logo"
                        className="w-8 h-8 object-contain"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-[#10BC5D] leading-tight">
                            FWMS
                        </h1>
                        <p className="text-[10px] text-[#8B8B8B] tracking-wider">
                            ADMIN SYSTEM
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-2">
                {menu.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl ${location.pathname === item.path
                            ? "bg-primary text-white"
                            : "hover:bg-primary/10"
                            }`}
                    >
                        <span className="material-symbols-outlined">
                            {item.icon}
                        </span>
                        <span className="text-sm">{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#10BC5D] flex items-center justify-center text-white text-sm font-bold">
                        A
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[#141C21]">
                            Admin Manager
                        </p>
                        <p className="text-[10px] text-[#8B8B8B]">
                            admin@foodwaste.vn
                        </p>
                    </div>
                </div>
                <button onClick={logout} className="flex items-center gap-2 text-[#8B8B8B] hover:text-[#141C21] w-full px-3 py-1.5 rounded-lg hover:bg-gray-100 text-xs">
                    <LogOut size={14} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
