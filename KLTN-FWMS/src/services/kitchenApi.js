// services/kitchenApi.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const kitchenApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor để tự động thêm token
kitchenApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

export const kitchenDishAPI = {
    // GET /kitchen/get-dishes-output/{brandID}
    getDishesOutput: async (brandId, date = null, page = 1, size = 5) => {
        let url = `/kitchen/get-dishes-output/${brandId}`;
        const params = new URLSearchParams();

        if (date) params.append("date", date);
        if (page) params.append("page", page);
        if (size) params.append("size", size);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        console.log("📡 API URL:", url);
        const response = await kitchenApi.get(url);
        return response.data;
    },

    // GET /kitchen/get-all-dishes
    getAllDishes: async () => {
        try {
            const response = await kitchenApi.get(`/kitchen/get-all-dishes`);
            return response.data;
        } catch (error) {
            console.error("Error fetching all dishes:", error);
            throw error;
        }
    },

    // POST /kitchen/create-dishes-daily/{brandID}
    createDishesDaily: async (brandId, data) => {
        const response = await kitchenApi.post(
            `/kitchen/create-dishes-daily/${brandId}`,
            data,
        );
        return response.data;
    },

    // POST /kitchen/create-dishes-new/{brandID}
    createDishesNew: async (brandId, data) => {
        const response = await kitchenApi.post(
            `/kitchen/create-dishes-new/${brandId}`,
            data,
        );
        return response.data;
    },

    // PUT /kitchen/update-dishes-output/{dailyDetailId}
    updateDishesOutput: async (dailyDetailId, data) => {
        const response = await kitchenApi.put(
            `/kitchen/update-dishes-output/${dailyDetailId}`,
            data,
        );
        return response.data;
    },

    // PUT /kitchen/update-dishes-leftover/{dailyDetailId}
    updateDishesLeftover: async (dailyDetailId, data) => {
        const response = await kitchenApi.put(
            `/kitchen/update-dishes-leftover/${dailyDetailId}`,
            data,
        );
        return response.data;
    },

    // API dashboard
    // GET /dashboard/kitchen/get-report-pay-yesterday
    getReportPayYesterday: async () => {
        try {
            const response = await kitchenApi.get(
                "/dashboard/kitchen/get-report-pay-yesterday",
            );
            console.log("Report pay yesterday:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching pay yesterday report:", error);
            throw error;
        }
    },

    // GET /dashboard/kitchen/get-report-leftover-dishes
    getReportLeftoverDishes: async () => {
        try {
            const response = await kitchenApi.get(
                "/dashboard/kitchen/get-report-leftover-dishes",
            );
            console.log("Report leftover dishes:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching leftover dishes report:", error);
            throw error;
        }
    },

    // GET /dashboard/kitchen/get-report-warning-dishes
    getReportWarningDishes: async () => {
        try {
            const response = await kitchenApi.get(
                "/dashboard/kitchen/get-report-warning-dishes",
            );
            console.log("Report warning dishes:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching warning dishes report:", error);
            throw error;
        }
    },
};

export default kitchenApi;
