import { createContext, useState } from "react";
import authService from "../services/auth.service.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

    const login = async (email, password) => {
        await authService.login(email, password);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
    };

    const value = { isAuthenticated, login, logout };

    return <AuthContext.Provider value={value}>{ children }</AuthContext.Provider>;
};
