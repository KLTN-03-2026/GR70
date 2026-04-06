import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const decode = jwtDecode(token);
    if (decode.role == "Manager") {
        return children;
    } else {
        return Navigate("/");
    }
};

export default PrivateRoute;