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
    getDishesOutput: async (brandId, date = null) => {
        let url = `/kitchen/get-dishes-output/${brandId}`;
        if (date) {
            url += `?date=${date}`;
        }
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
        console.log("=== CREATE DISHES DAILY ===");
        console.log("Brand ID:", brandId);
        console.log("Data gửi đi:", data);
        console.log("Data type:", typeof data);
        console.log("Data stringify:", JSON.stringify(data));

        try {
            const response = await kitchenApi.post(
                `/kitchen/create-dishes-daily/${brandId}`,
                data,
            );
            console.log("Response success:", response.data);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            throw error;
        }
    },

    // POST /kitchen/create-dishes-new/{brandID}
    createDishesNew: async (brandId, data) => {
        try {
            const response = await kitchenApi.post(
                `/kitchen/create-dishes-new/${brandId}`,
                data,
            );
            return response.data;
        } catch (error) {
            console.error(
                "Error response from createDishesNew:",
                error.response?.data,
            );
            throw error;
        }
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

    // ========== THÊM 3 API MỚI CHO DASHBOARD ==========

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
