import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Utensils, User, Mail, Phone, MapPin, Calendar } from "lucide-react";

export default function ManagerDetail() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [manager, setManager] = useState(null);
  const [kitchens, setKitchens] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `https://system-waste-less-ai.onrender.com/api/admin/account/get-account-detail/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data.data;

        // ✅ Manager (luôn chỉ 1 người)
        const managerData = data.manager?.users?.[0] || null;

        setManager(
          managerData
            ? {
                name: managerData.name,
                email: managerData.email,
                phone: managerData.phone,
                address: managerData.address,
                joinDate: managerData.created_at?.split("T")[0],
              }
            : null
        );

        // ✅ Kitchen list (đầy đủ như API)
        const kitchenList = data.kitchen?.users || [];

        // 👉 sort mới nhất lên đầu (cho đẹp UI)
        const sortedKitchen = kitchenList.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setKitchens(sortedKitchen);
      } catch (err) {
        console.log("Lỗi:", err);
      }
    };

    fetchDetail();
  }, [id, token]);

  if (!manager)
    return (
      <div className="p-6 text-gray-500 animate-pulse">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="p-6 space-y-6 bg-[#F6F8FA] min-h-screen">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow">
        
        <p className="text-sm opacity-90">
          Chi tiết nhân viên quán
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT - MANAGER */}
        <div className="bg-white p-5 rounded-xl shadow-sm space-y-4 hover:shadow-md transition">

          <h3 className="font-semibold text-gray-700">
            Thông tin quản lý
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User size={16} className="text-gray-400" />
              <span>{manager.name}</span>
            </div>


            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400" />
              <span>{manager.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-400" />
              <span>{manager.phone || "---"}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-400" />
              <span>{manager.address || "---"}</span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-gray-400" />
              <span>{manager.joinDate}</span>
            </div>

          </div>
        </div>

        {/* RIGHT - KITCHEN LIST */}
        <div className="col-span-2 bg-white p-5 rounded-xl shadow-sm space-y-4">

          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">
              Danh sách nhân viên Kitchen
            </h3>

            <span className="text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full">
              {kitchens.length} người
            </span>
          </div>

          {kitchens.map((kitchen, index) => (
            <div
              key={index}
              className="flex justify-between items-center border rounded-xl p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center gap-4">

                <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                  <Utensils size={18} />
                </div>

                <div>
                  <p className="font-medium text-gray-800">
                    {kitchen.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {kitchen.email}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-500 flex gap-6">
                <span>📞 {kitchen.phone || "-"}</span>
                <span>
                  📅 {kitchen.created_at?.split("T")[0]}
                </span>
              </div>
            </div>
          ))}

          {kitchens.length === 0 && (
            <div className="text-center text-gray-400 py-6">
              Không có nhân viên
            </div>
          )}

        </div>

      </div>
    </div>
  );
}