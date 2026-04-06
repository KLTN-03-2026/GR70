import React from "react";
import { Camera, Lock, ChevronRight } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="p-6 bg-[#F6F8FA] min-h-screen">
            {/* Header */}
            <div className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#141C21]">
                        Thông tin cá nhân
                    </h1>
                    <p className="text-sm text-[#8B8B8B]">
                        Quản lý và cập nhật hồ sơ thành viên của bạn
                    </p>
                </div>
                <span className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded-full">
                    ● ĐANG HOẠT ĐỘNG
                </span>
            </div>

            <div className="grid grid-cols-3 gap-5">
                {/* LEFT */}
                <div className="col-span-2 space-y-10">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm flex gap-6 items-center">
                        <div className="relative">
                            <img
                                src="https://i.pravatar.cc/120"
                                className="w-24 h-24 rounded-lg object-cover"
                            />
                            <button className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-md">
                                <Camera size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Họ tên</p>
                                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                                    Trần Hoàng Nam
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 mb-1">Email</p>
                                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                                    nam@mail.com
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 mb-1">Số điện thoại</p>
                                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                                    0901 234 567
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 mb-1">Ngày tham gia</p>
                                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                                    27 Tháng 03, 2023
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Work Info */}
                    <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                        <h4 className="font-semibold text-[#141C21]">
                            Thông tin công việc
                        </h4>

                        <div className="bg-[#F1F5F4] p-3 rounded-lg text-sm">
                            Nhà hàng ABC - CN Quận 1
                        </div>

                        <div className="bg-[#F1F5F4] p-3 rounded-lg text-sm">
                            Ca Sáng (06:00 - 14:00)
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {["Món Khai Vị", "Súp Âu", "Salad Sáng Tạo", "Tráng miệng"].map(
                                (item, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full"
                                    >
                                        {item}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-6">
                    {/* Role */}
                    <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                        <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600 text-xl">
                            🍴
                        </div>
                        <p className="text-sm text-gray-400">Vai trò</p>
                        <h3 className="font-semibold text-green-600">Nhân viên Bếp</h3>
                        <p className="text-xs text-gray-400 mt-2">
                            Chịu trách nhiệm quản lý nguyên liệu và giảm thiểu lãng phí thực phẩm.
                        </p>
                    </div>

                    {/* Settings */}
                    <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                        <h4 className="font-semibold text-[#141C21]">
                            Cài đặt tài khoản
                        </h4>

                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg text-sm cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Lock size={16} />
                                Đổi mật khẩu
                            </div>
                            <ChevronRight size={16} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Thông báo lãng phí</span>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-0.5" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Thông báo chat</span>
                            <div className="w-10 h-5 bg-gray-300 rounded-full relative">
                                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-0.5" />
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Bottom Section */}
            <div className="mt-6 flex justify-end gap-3">
                <button className="px-4 py-2 text-sm text-gray-500">
                    Hủy
                </button>
                <button className="px-5 py-2 bg-[#10BC5D] text-white rounded-lg text-sm">
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
}

