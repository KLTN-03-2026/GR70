export const getWasteReport = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        summary: {
          totalWaste: 428.5,
          wasteRate: 4.8,
          damageCost: 12450000,
          reductionRate: 15.2,
        },
        topWaste: [
          { name: "Thịt bò Úc", amount: 45.2, unit: "kg", trend: 12 },
          { name: "Trứng gà ta", amount: 28.0, unit: "kg", trend: -5 },
          { name: "Sữa tươi không đường", amount: 22.5, unit: "L", trend: 0 },
          { name: "Xà lách thủy canh", amount: 18.7, unit: "kg", trend: 8 },
          { name: "Kem tươi", amount: 15.0, unit: "kg", trend: -15 },
        ],
        reasons: [
          { name: "Hết hạn", value: 45 },
          { name: "Khách bỏ thừa", value: 25 },
          { name: "Sơ chế sai", value: 20 },
          { name: "Bảo quản lỗi", value: 10 },
        ],
      });
    }, 500); // giả lập delay API
  });
};