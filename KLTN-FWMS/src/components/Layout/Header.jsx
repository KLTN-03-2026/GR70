import React from "react";
import { Bell, Search } from "lucide-react";

const Header = () => {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-1 ">
                <div className="relative w-96">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B8B8B]"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg paragraph-small focus:outline-none focus:border-[#10BC5D]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-gray-100 rounded-full">
                    <Bell size={20} className="text-[#3D3D3D]" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
            </div>
        </header>
    );
};

export default Header;
