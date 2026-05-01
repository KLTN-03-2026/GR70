import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    AlertTriangle,
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
import logo from "../../assets/Logo.svg";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [openMenus, setOpenMenus] = useState({
        consumption: true,
    });
    
    const token = localStorage.getItem("token");
    const decode = jwtDecode(token);

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menu]: !prev[menu],
        }));
    };

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    }

    const isConsumptionActive =
        location.pathname.includes("/customers") ||
        location.pathname.includes("/food-data");

    return (
        <div className="w-80 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col">
            {/* Logo - Đã chỉnh nhỏ lại */}
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
                            MANAGEMENT SYSTEM
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3">
                {/* Dashboard */}
                <NavLink
                    to="/app"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                            ? "bg-[#10BC5D] text-white"
                            : "text-[#3D3D3D] hover:bg-gray-100"
                        }`
                    }
                >
                    <LayoutDashboard size={18} />
                    <span className="text-sm font-medium">Bảng điều khiển</span>
                </NavLink>

                {/* Quản lý tiêu thụ với submenu */}
                <div className="mb-1">
                    <button
                        onClick={() => toggleMenu("consumption")}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${isConsumptionActive
                            ? "bg-[#10BC5D] text-white"
                            : "text-[#3D3D3D] hover:bg-gray-100"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Users size={18} />
                            <span className="text-sm font-medium">
                                Quản lý tiêu thụ
                            </span>
                        </div>
                        {openMenus.consumption ? (
                            <ChevronDown
                                size={16}
                                className={
                                    isConsumptionActive
                                        ? "text-white"
                                        : "text-[#8B8B8B]"
                                }
                            />
                        ) : (
                            <ChevronRight
                                size={16}
                                className={
                                    isConsumptionActive
                                        ? "text-white"
                                        : "text-[#8B8B8B]"
                                }
                            />
                        )}
                    </button>

                    {openMenus.consumption && (
                        <div className="ml-6 mt-1 pl-3 border-l-2 border-gray-200">
                            <NavLink
                                to="/app/customers"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${isActive
                                        ? "bg-[#10BC5D] text-white"
                                        : "text-[#3D3D3D] hover:bg-gray-100"
                                    }`
                                }
                            >
                                <span className="text-sm">
                                    Quản lý số lượng khách hàng
                                </span>
                            </NavLink>
                            <NavLink
                                to="/app/food-data"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${isActive
                                        ? "bg-[#10BC5D] text-white"
                                        : "text-[#3D3D3D] hover:bg-gray-100"
                                    }`
                                }
                            >
                                <span className="text-sm">Dữ liệu món ăn</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Các menu khác */}
                <NavLink
                    to="/app/accounts"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                            ? "bg-[#10BC5D] text-white"
                            : "text-[#3D3D3D] hover:bg-gray-100"
                        }`
                    }
                >
                    <UserCircle size={18} />
                    <span className="text-sm font-medium">
                        Quản lý tài khoản
                    </span>
                </NavLink>

                <NavLink
                    to="foods"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                            ? "bg-[#10BC5D] text-white"
                            : "text-[#3D3D3D] hover:bg-gray-100"
                        }`
                    }
                >
                    <Utensils size={18} />
                    <span className="text-sm font-medium">
                        Quản lý nguyên liệu
                    </span>
                </NavLink>

                <NavLink
                    to="ingredients"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                            ? "bg-[#10BC5D] text-white"
                            : "text-[#3D3D3D] hover:bg-gray-100"
                        }`
                    }
                >
                    <Utensils size={18} />
                    <span className="text-sm font-medium">
                        Quản lý món ăn
                    </span>
                </NavLink>



                <NavLink
                    to="/app/waste-base"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                            ? "bg-[#10BC5D] text-white"
                            : "text-[#3D3D3D] hover:bg-gray-100"
                        }`
                    }
                >
                    <AlertTriangle size={18} />
                    <span className="text-sm font-medium">
                        Báo cáo lãng phí
                    </span>
                </NavLink>

                <NavLink
                    to="/app/waste-history"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                            ? "bg-[#10BC5D] text-white"
                            : "text-[#3D3D3D] hover:bg-gray-100"
                        }`
                    }
                >
                    <History size={18} />
                    <span className="text-sm font-medium">
                        Lịch sử lãng phí
                    </span>
                </NavLink>
                {/* thống kê doanh thu */}
                <NavLink
                    to="/app/revenue"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                            ? "bg-[#10BC5D] text-white"
                            : "text-[#3D3D3D] hover:bg-gray-100"
                        }`
                    }
                >
                    <BarChart3 size={18} />
                    <span className="text-sm font-medium">
                        Thống kê doanh thu
                    </span>
                </NavLink>
                <NavLink
                    to="/app/profile"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                            ? "bg-[#10BC5D] text-white"
                            : "text-[#3D3D3D] hover:bg-gray-100"
                        }`
                    }
                >
                    <UserCircle size={18} />
                    <span className="text-sm font-medium">
                        Thông tin cá nhân
                    </span>
                </NavLink>
            </div>

            {/* User Info - Cố định dưới cùng */}
            <div className="px-3 py-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#10BC5D] flex items-center justify-center text-white text-sm font-bold">
                        {decode?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[#141C21]">
                            {decode?.name}
                        </p>
                        <p className="text-[10px] text-[#8B8B8B]">
                            {decode?.email}
                        </p>
                    </div>
                </div>
                <button onClick={logout} className="flex items-center gap-2 text-[#8B8B8B] hover:text-[#141C21] w-full px-3 py-1.5 rounded-lg hover:bg-gray-100 text-xs">
                    <LogOut size={14} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
