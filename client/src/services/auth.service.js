import axiosInstance from "./config/axios.config.js";

const authService = {
    login: async (email, password) => {
        const response = await axiosInstance.post("/auth/login", { email, password });
        localStorage.setItem("token", response.data.token);
        return response.data;
    },

    register: async (email, password, confirmPassword) => {
        const response = await axiosInstance.post("/auth/register", { email, password, confirmPassword });
        return response.data;
    },

    logout: async () => {
        localStorage.removeItem("token");
    },

    isAuthenticated: () => {
        return !!localStorage.getItem("token");
    }
}

export default authService;