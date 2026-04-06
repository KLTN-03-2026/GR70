import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

export const AdminRoute = ({children}) => {
    const token = localStorage.getItem("token");
    const decode = jwtDecode(token);
    return decode.role == "Admin" ? children : <Navigate to={"/"}/>
}
