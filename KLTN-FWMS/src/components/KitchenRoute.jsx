import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';
const KitchenRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const decode = jwtDecode(token);
    return decode.role == "Kitchen" ? children : <Navigate to={"/"}/>
}

export default KitchenRoute;

