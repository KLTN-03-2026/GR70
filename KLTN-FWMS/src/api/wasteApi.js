const wasteHistory = [
  {
    id: 1,
    date: "2026-03-13",
    name: "Bông cải xanh",
    type: "Nguyên liệu",
    weight: 5.0,
    wastePercent: 10,
    costPerKg: 30000,
  },
  {
    id: 2,
    date: "2026-03-13",
    name: "Cơm trắng",
    type: "Món ăn",
    weight: 12.5,
    wastePercent: 18,
    costPerKg: 15000,
  },
  {
    id: 3,
    date: "2026-02-10",
    name: "Thịt bò thăn",
    type: "Nguyên liệu",
    weight: 2.2,
    wastePercent: 6,
    costPerKg: 250000,
  },
  {
    id: 4,
    date: "2026-01-05",
    name: "Cá hồi tươi",
    type: "Nguyên liệu",
    weight: 0.8,
    wastePercent: 20,
    costPerKg: 400000,
  },
];

// 🤖 AI logic
const calcAI = (produced, used) => {
  const leftover = produced - used;
  const percent = Math.round((leftover / produced) * 100);

  let aiLevel = "Low";
  let aiReason = "Hoạt động ổn định";

  if (percent > 20) {
    aiLevel = "High";
    aiReason = "Dự báo sai nhu cầu hoặc chế biến quá nhiều";
  } else if (percent > 10) {
    aiLevel = "Medium";
    aiReason = "Nhu cầu giảm nhẹ hoặc dư nguyên liệu";
  }

  return { leftover, percent, aiLevel, aiReason };
};

// API
export const getWasteHistory = ({ date, month } = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = [...wasteHistory];

      // filter theo ngày
      if (date) {
        data = data.filter((item) => item.date === date);
      }

      // filter theo tháng
      if (month) {
        data = data.filter((item) =>
          item.date.startsWith(month)
        );
      }

      // 🔥 convert data sang format UI mới
      data = data.map((item) => {
        // giả lập: 1kg = 10 suất
        const produced = Math.round(item.weight * 10);

        // dùng wastePercent để tính lượng dùng
        const used = Math.round(produced * (1 - item.wastePercent / 100));

        const { leftover, percent, aiLevel, aiReason } = calcAI(
          produced,
          used
        );

        return {
          id: item.id,
          date: item.date,
          name: item.name,

          produced,
          used,
          leftover,
          leftoverPercent: percent,

          aiLevel,
          aiReason,
        };
      });

      resolve({
        data,
        total: data.length,
      });
    }, 500);
  });
};