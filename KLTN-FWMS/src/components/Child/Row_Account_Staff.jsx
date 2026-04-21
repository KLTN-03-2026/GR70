import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
export const Row_Account_Staff = () => {
    const [datastaff, setDatastaff] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [openform_changekitchen, setopenform_changekitchen] = useState(null);
    const [visibility_password, setVisibility_Password] = useState(null);
    const token = localStorage.getItem("token");
    const [countID, setcountID] = useState(null);
    //Filter
    const [filterStatus, setFilterStatus] = useState("all");
    
    const filteredStaff = Array.isArray(datastaff)
        ? datastaff.filter((staff) => {
            if (filterStatus === "active") return staff.status === true;
            if (filterStatus === "locked") return staff.status === false;
            return true;
        })
        : [];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("https://system-waste-less-ai.onrender.com/api/users/get-kitchen-staff",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log(res.data.data.data);
                setDatastaff(
                    Array.isArray(res.data.data.data) ? res.data.data.data : []
                );

            } catch (err) {
                console.log(err);
            }
        };
        fetchUser();
    }, [token]);

    useEffect(() => {
        if (openform_changekitchen) {
            setform_ChangeUser({
                name: openform_changekitchen.name || "",
                email: openform_changekitchen.email || "",
                phone: openform_changekitchen.phone || "",
                address: openform_changekitchen.address || "",
                password: openform_changekitchen.password || "",
            })
        }
    }, [openform_changekitchen?.id]);

    const [form_ChangeUser, setform_ChangeUser] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
    });

    const handle_ChangeUser = (e) => {
        setform_ChangeUser({
            ...form_ChangeUser,
            [e.target.name]: e.target.value,
        });
    }

    const handle_UpdateUser = async (e) => {
        e.preventDefault();
        const dataUpdate = { ...form_ChangeUser };

        //nếu email không đổi → xóa
        if (dataUpdate.email === openform_changekitchen.email) {
            delete form_ChangeUser.email;
        }
        //nếu password rỗng → xóa
        if (!dataUpdate.password) {
            delete dataUpdate.password;
        }
        //nếu không có gì thay đổi
        if (dataUpdate.name === openform_changekitchen.name &&
            dataUpdate.email === openform_changekitchen.email &&
            dataUpdate.phone === openform_changekitchen.phone &&
            dataUpdate.address === openform_changekitchen.address &&
            !dataUpdate.password) {
            return toast.warning("Không có gì thay đổi!");
        }


        if (openform_changekitchen) {
            if (openform_changekitchen.status == false) {
                toast.error("Không thể sửa tài khoản đã bị khóa!");
                return;
            }
            try {
                const res = await axios.put(`https://system-waste-less-ai.onrender.com/api/users/update-kitchen/${openform_changekitchen.id}`,
                    form_ChangeUser,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                    }
                );
                toast.success("Sửa thông tin thành công!");
                window.location.reload();
            } catch (error) {
                console.log(error);
            }
        } else {
            toast.error("Lỗi! Sửa thông tin không thành công");
        }
    }

    const Lock_UnLock_Kitchen = async (id, currentStatus) => {
        const confirm = window.confirm(
            currentStatus ? "Khóa tài khoản này" : "Mở tài khoản này"
        );
        if (!confirm) return;
        console.log(currentStatus);

        try {
            let Url = "";
            if (currentStatus) {
                Url = `https://system-waste-less-ai.onrender.com/api/users/lock-kitchen/${id}`;
            } else {
                Url = `https://system-waste-less-ai.onrender.com/api/users/unlock-kitchen/${id}`;
                console.log(Url);

            }
            const res = await axios.put(Url,
                {
                    status: !currentStatus,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (res.data.success) {
                setDatastaff(prev =>
                    prev.map(staff =>
                        staff.id === id
                            ? { ...staff, status: !currentStatus }
                            : staff
                    )
                );
            }
        } catch (error) {
            console.log(error);

        }
    }
    // console.log(datastaff);

    return (
        <>
            <div className={`w-full gap-8 transition-all duration-300 flex relative`}>
                {/* Table Section */}

                <div className={`space-y-6 transition-all duration-300 ${selectedStaff == null ? "w-full" : "w-2/3"}`}>
                    {/* Tabs */}
                    <div className="border-b border-slate-200 ">
                        <nav className="flex gap-8 transition-all duration-300">
                            <button onClick={() => setFilterStatus("all")} className={`${filterStatus === "all" ? "border-primary text-primary border-b-2" : "text-slate-500 hover:text-slate-700 border-b-2 border-[#0000]"} pb-3 text-sm`}>
                                Tất cả
                            </button>
                            <button onClick={() => setFilterStatus("active")} className={`${filterStatus === "active" ? "border-primary text-primary border-b-2" : "text-slate-500 hover:text-slate-700 border-b-2 border-[#0000]"} pb-3 text-sm`}>
                                Đang hoạt động
                            </button>
                            <button onClick={() => setFilterStatus("locked")} className={`${filterStatus === "locked" ? "border-primary text-primary border-b-2" : "text-slate-500 hover:text-slate-700 border-b-2 border-[#0000]"} pb-3 text-sm`}>
                                Đã khóa
                            </button>
                        </nav>
                    </div>


                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">

                            <table className={`text-left border-collapse w-full`}>
                                <thead>
                                    <tr className="bg-slate-50 text-center">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Active</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 ">

                                    {filteredStaff.map((staff, index) => (
                                        <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group text-center">

                                            <td key={staff.id} className="px-3 py-4 text-sm font-medium">
                                                {index + 1}
                                            </td>

                                            <td className="px-3 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {staff.name?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-sm font-bold">
                                                            {staff.name}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {staff.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold ">
                                                    Nhân viên bếp
                                                </span>
                                            </td>

                                            <td className="px-3 py-4">
                                                <span className={` text-xs font-bold  ${staff.status == true ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                                                    {staff.status == true ? (<span className='items-center flex gap-[5px] justify-center' ><i class="fa-solid fa-circle text-[8px] "></i> Đang hoạt động</span>) : (<span className='items-center flex gap-[5px] justify-center'><i class="fa-solid fa-lock text-[8px]"></i> Đã khóa</span>)}
                                                </span>
                                            </td>

                                            <td onClick={() => Lock_UnLock_Kitchen(staff.id, staff.status)} className='flex justify-center text-[24px] mt-[24%]'>
                                                {staff.status == true ? (<i class="fa-solid fa-toggle-on text-emerald-600 cursor-pointer"></i>) : (<i class="fa-solid fa-toggle-off text-[#94A3B8] cursor-pointer"></i>)}
                                            </td>

                                            <td className="px-3 py-4 text-right w-1">
                                                <div className="flex items-center justify-center gap-2 transition-opacity">
                                                    <button key={staff.id} onClick={() => { setSelectedStaff(staff); setcountID(index + 1) }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600" title="Xem thông tin">
                                                        <span className="material-symbols-outlined text-[20px] mt-[6px]">visibility</span>
                                                    </button>
                                                    {/* <button onClick={() => setopenform_changekitchen(staff)} className="p-2 hover:bg-primary/10 rounded-lg text-primary" title="Chỉnh sửa">
                                                        <span className="material-symbols-outlined text-[20px] mt-[6px]">edit</span>
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {openform_changekitchen && (
                                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                                            <div className="bg-white w-full max-w-[520px] rounded-xl shadow-2xl overflow-hidden">
                                                {/* Modal Header */}
                                                <div className="px-8 pt-8 pb-4">
                                                    <h5 className="font-arimo text-[24px] font-bold text-[#141C21] mb-1">Sửa thông tin tài khoản Bếp</h5>
                                                    <p className="text-muted-text text-sm font-nunito">Chỉnh sửa thông tin mới cho nhân viên bộ phận bếp của đơn vị.</p>
                                                </div>
                                                {/* Modal Body / Form */}
                                                <form className="px-8 pb-8 space-y-5" onSubmit={handle_UpdateUser}>
                                                    {/* Full Name */}
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="label-style">Họ tên</label>
                                                        <input
                                                            className="form-input w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 text-secondary-text focus:border-primary focus:ring-primary/20 font-nunito"
                                                            placeholder="Nhập họ và tên đầy đủ"
                                                            type="text"
                                                            name='name'
                                                            value={form_ChangeUser.name}
                                                            onChange={handle_ChangeUser}
                                                        />

                                                    </div>
                                                    {/* Email */}
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="label-style">Email</label>
                                                        <input
                                                            className="form-input w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 text-secondary-text focus:border-primary focus:ring-primary/20 font-nunito"
                                                            placeholder="example@domain.com"
                                                            type="email"
                                                            name='email'
                                                            value={form_ChangeUser.email}
                                                            onChange={handle_ChangeUser}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="label-style">Số điện thoại</label>
                                                        <input
                                                            className="form-input w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 text-secondary-text focus:border-primary focus:ring-primary/20 font-nunito"
                                                            placeholder="0345651074"
                                                            type="text"
                                                            name='phone'
                                                            value={form_ChangeUser.phone}
                                                            onChange={handle_ChangeUser}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="label-style">Địa chỉ</label>
                                                        <input
                                                            className="form-input w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 text-secondary-text focus:border-primary focus:ring-primary/20 font-nunito"
                                                            placeholder="123 Đường Nguyễn Huệ, Quận 1, TP.HCM"
                                                            type="text"
                                                            name='address'
                                                            value={form_ChangeUser.address}
                                                            onChange={handle_ChangeUser}
                                                        />
                                                    </div>
                                                    {/* Password */}
                                                    {/* <div className="flex flex-col gap-1.5">
                                                        <label className="label-style">Mật khẩu mới</label>
                                                        <div className="relative">
                                                            <input
                                                                className="form-input w-full rounded-lg border-primary/20 bg-background-light px-4 py-3 text-secondary-text focus:border-primary focus:ring-primary/20 font-nunito pr-12"
                                                                placeholder="Nhập mật khẩu mới"
                                                                type={visibility_password ? "text" : "password"}
                                                                name='password'
                                                                value={form_ChangeUser.password}
                                                                onChange={handle_ChangeUser}
                                                            />
                                                            <button
                                                                onClick={() => setVisibility_Password(!visibility_password)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-primary transition-colors"
                                                                type="button"
                                                            >
                                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                            </button>
                                                        </div>
                                                    </div> */}

                                                    {/* Actions */}
                                                    <div className="flex items-center justify-end gap-3 pt-4">
                                                        <button
                                                            onClick={() => setopenform_changekitchen(false)}
                                                            className="px-6 py-2.5 rounded-lg border border-primary/30 text-secondary-text font-nunito font-semibold hover:bg-primary/5 transition-all"
                                                            type="button"
                                                        >
                                                            Hủy
                                                        </button>
                                                        <button
                                                            className="px-8 py-2.5 rounded-lg bg-primary text-white font-nunito font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                                                            type="submit"
                                                        >
                                                            Lưu thay đổi
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Đang hiển thị 1-3 của 24 nhân viên</span>
                            <div className="flex gap-2">
                                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-50" disabled>
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">1</button>
                                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white font-bold text-sm">2</button>
                                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white font-bold text-sm">3</button>
                                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white">
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Detail Section (Simulated Sidebar Info) */}
                {selectedStaff && (
                    <>
                        <div className={`transition-all duration-300 ease-in-out w-[30%] bg-white absolute right-0 rounded-2xl shadow-sm border border-slate-200 group p-6 mt-14`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Xem thông tin cá nhân</h3>
                                {/* <button onClick={() => setopenform_changekitchen(selectedStaff)} className="text-primary hover:underline text-sm font-bold">Chỉnh sửa</button> */}
                            </div>
                            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 mb-6">
                                <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black mb-4 border-4 border-white shadow-xl">
                                    {selectedStaff.name.charAt(0)}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900">{selectedStaff.name}</h4>
                                <p className="text-slate-500 font-medium">{selectedStaff.role}</p>
                                <div className="mt-4 flex gap-2">
                                    <span className={`px-3 py-1 ${selectedStaff.status == true ? "bg-emerald-100  text-emerald-700" : "bg-[#F1F5F9]  text-[#475569]"} rounded-full text-xs font-bold`}>{selectedStaff.status == true ? (<span className='items-center flex gap-[5px]' ><i class="fa-solid fa-circle text-[8px]"></i> Đang hoạt động</span>) : (<span className='items-center flex gap-[5px]'><i class="fa-solid fa-lock text-[10px]"></i> Đã khóa</span>)}</span>

                                    <span className={`px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold`}>ID: KT{countID}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Email</span>
                                    <span className="text-sm text-slate-700 font-medium">{selectedStaff.email}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Vai trò</span>
                                    <span className="text-sm text-slate-700 font-medium">Nhân viên bếp</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Số điện thoại</span>
                                    <span className="text-sm text-slate-700 font-medium">{selectedStaff.phone}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Ngày gia nhập</span>
                                    <span className="text-sm text-slate-700 font-medium">{new Date(selectedStaff.created_at).toLocaleDateString("vi-VN")}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Địa chỉ</span>
                                    <span className="text-sm text-slate-700 font-medium truncate">{selectedStaff.address}</span>
                                </div>
                            </div>
                            {/* <div className="mt-8">
                                <button className="w-full py-3 border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-colors">
                                    Xem doanh thu
                                </button>
                            </div> */}

                            <button onClick={() => setSelectedStaff(null)} className='absolute top-0 right-[-16px] group-hover:opacity-100 opacity-0 transition-all duration-300 group-hover:translate-y-[-14.5px]  rounded-[50%]'><i class="fa-solid fa-circle-xmark text-red-500 text-3xl"></i></button>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
