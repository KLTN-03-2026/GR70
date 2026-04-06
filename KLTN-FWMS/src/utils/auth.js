
import { jwtDecode } from "jwt-decode";

export const getUserInfo = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        return jwtDecode(token);   // jwtDecode phải là named import
    } catch (err) {
        console.error("Token decode error:", err);
        localStorage.removeItem("token"); // xóa token hỏng
        return null;
    }
};