import axiosInstance from "./config/axios.config.js";

const contactService = {
    getAll: async () => {
        const response = await axiosInstance.get("/contact/");
        return response.data;
    },

    create: async (firstName, lastName, phone) => {
        const response = await axiosInstance.post("/contact/", { firstName, lastName, phone });
        return response.data;
    },

    update: async (id, firstName, lastName, phone) => {
        const response = await axiosInstance.patch(`/contact/${id}`, { firstName, lastName, phone });
        return response.data;
    },

    delete: async (id) => {
        const response = await axiosInstance.delete(`/contact/${id}`);
        return response.data;
    }
}

export default contactService;