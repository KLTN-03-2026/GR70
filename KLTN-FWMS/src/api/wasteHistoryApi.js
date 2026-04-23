// src/api/wasteHistoryApi.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const wasteHistoryApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor để tự động thêm token
wasteHistoryApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log("🚀 API Request:", config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => Promise.reject(error),
);

// ========== API CHO LỊCH SỬ LÃNG PHÍ ==========

// ========== API CHO LỊCH SỬ LÃNG PHÍ ==========

// GET /history/sum-waste-by-month - Tổng lãng phí theo tháng
export const getSumWasteByMonth = async (month) => {
    try {
        let url = "/history/sum-waste-by-month";
        if (month && month !== "null" && month !== "") {
            url += `?month=${month}`;
        }
        console.log("📊 getSumWasteByMonth URL:", url);
        const response = await wasteHistoryApi.get(url);
        console.log("📊 getSumWasteByMonth Response:", response.data);
        // Trả về toàn bộ response.data để component tự xử lý
        return response.data;
    } catch (error) {
        console.error("Error fetching sum waste by month:", error);
        throw error;
    }
};

// GET /history/sum-waste-by-month-compare - So sánh lãng phí theo tháng
export const getSumWasteByMonthCompare = async (month) => {
    try {
        let url = "/history/sum-waste-by-month-compare";
        if (month && month !== "null" && month !== "") {
            url += `?month=${month}`;
        }
        console.log("📊 getSumWasteByMonthCompare URL:", url);
        const response = await wasteHistoryApi.get(url);
        console.log("📊 getSumWasteByMonthCompare Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching sum waste compare:", error);
        throw error;
    }
};

// GET /history/list-waste-by-ingredient - Danh sách lãng phí
export const getListWasteByIngredient = async (params = {}) => {
    try {
        const { date, month, startDate, endDate, dishId } = params;
        let url = "/history/list-waste-by-ingredient";
        const queryParams = [];
        
        // ⚠️ SỬA: Chỉ gửi date hoặc month, không gửi cả 2
        if (date && date !== "") {
            queryParams.push(`date=${date}`);
        } else if (month && month !== "") {
            queryParams.push(`month=${month}`);
        }
        
        // Các params khác
        if (startDate) queryParams.push(`startDate=${startDate}`);
        if (endDate) queryParams.push(`endDate=${endDate}`);
        if (dishId) queryParams.push(`dishId=${dishId}`);
        
        if (queryParams.length > 0) {
            url += `?${queryParams.join("&")}`;
        }
        
        console.log("🍽️ getListWasteByIngredient URL:", url);
        const response = await wasteHistoryApi.get(url);
        console.log("🍽️ Response data count:", response.data?.data?.length || 0);
        return response.data; // { success, data: [...] }
    } catch (error) {
        console.error("Error fetching list waste by ingredient:", error);
        throw error;
    }
};

export default wasteHistoryApi;
