// src/api/revenueApi.js

export const getRevenueStats = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    today: 12450000,
                    month: 428900000,
                    growth: 24.8,
                },
            });
        }, 500);
    });
};

export const getRevenueChart = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: [
                    { name: "01 Nov", value: 200 },
                    { name: "03 Nov", value: 300 },
                    { name: "05 Nov", value: 250 },
                    { name: "07 Nov", value: 400 },
                    { name: "09 Nov", value: 350 },
                    { name: "11 Nov", value: 500 },
                    { name: "13 Nov", value: 450 },
                    { name: "15 Nov", value: 550 },
                    { name: "17 Nov", value: 600 },
                ],
            });
        }, 500);
    });
};

export const getTransactions = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: [
                    {
                        id: 1,
                        date: "19/03/2026",
                        name: "phở",
                        quantity: 3,
                        amount: 2500000,
                        status: "success",
                    },
                    {
                        id: 2,
                        date: "19/03/2026",
                        name: "cơm",
                        quantity: 2, 
                        amount: 1200000,
                        status: "pending",
                    },
                ],
            });
        }, 500);
    });
};