import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/auth.context.jsx";

export default function PrivateRoutes() {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <Outlet />;
}
