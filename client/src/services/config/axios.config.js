import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_API_URL || "http://localhost:3000",
    headers: {
        "Content-Type": "application/json"
    }
});

axiosInstance.interceptors.request.use(request => {
    const token = localStorage.getItem("token");
    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401 || status === 498) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
            return Promise.reject(error.response.data);
        }

        return Promise.reject({
            message: "Connection to server failed",
            type: "NETWORK_ERROR"
        });
    }
);

export default axiosInstance;