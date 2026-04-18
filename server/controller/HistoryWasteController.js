const ApiError = require("../utils/ApiError");
const ApiSuccess = require("../utils/ApiSuccess");
const DailyServices = require("../services/DailyServices");
const DailyRepository = require("../repository/DailyRepository");
const AIRepository = require("../repository/AIRepository");
//tổng món ăn lãng phí trong 1 tháng
exports.SumWasteByMonth = async (req, res, next) => {
  try {
    const brandID = req.user.brandID;
    const result = await DailyRepository.SumWasteByMonth(brandID);
    return res.json(ApiSuccess.getSelect("Sum waste by month", result));
  } catch (error) {
    return next(error);
  }
};
//tỉ lệ lãng phí giữa 2 tháng (hiện tại và tháng trước)
exports.SumWasteByMonthCompare = async (req, res, next) => {
  try {
    const brandID = req.user.brandID;
    const prev = new Date();
    prev.setMonth(prev.getMonth() - 1);

    const month = {
      year: prev.getFullYear(),
      month: prev.getMonth(),
    };
    const Current = await DailyRepository.SumWasteByMonth(brandID);
    const Previous = await DailyRepository.SumWasteByMonth(brandID, month);
    // console.log("Current", Current.total_waste);
    // console.log("Previous", Previous.total_waste);

    let result =
      (Number(Current.total_waste) / Number(Previous.total_waste)) * 100;
    if (Number(Current.total_waste) > Number(Previous.total_waste)) {
      result = "+" + result;
    } else if (
      Number(Previous.total_waste) === null || Number(Previous.total_waste) === 0 &&
      Number(Current.total_waste) > 0
    ) {
      result = "+" + "100";
    } else if (
      Number(Current.total_waste) === null || Number(Current.total_waste) === 0 &&
      Number(Previous.total_waste) > 0
    ) {
      result = "-" + "100";
    } else if (Number(Current.total_waste) < Number(Previous.total_waste)) {
      result = "-" + result;
    } else {
      result = "0";
    }
    return res.json(ApiSuccess.getSelect("Sum waste by month compare", result));
  } catch (error) {
    return next(error);
  }
};
// danh sách lãng phí món ăn
exports.ListWasteByIngredient = async (req, res, next) => {
  try {
    const brandID = req.user.brandID;
    const month = await DailyServices.checkMonth();
    const resultAI =
      await AIRepository.getAi_Analysis_Waste_By_BrandID(brandID);
    const resultDaily = await DailyRepository.ListWasteByIngredient(brandID,month);

    // console.log("ai", JSON.stringify(resultAI || [], null, 2));
    // console.log("daily", JSON.stringify(resultDaily || [], null, 2));

    const aiMap = {};

    // AI đang là raw flattened object
    resultAI.forEach((aiRecord) => {
      const date = aiRecord["date"] ?? null;
      const dishId = aiRecord["ai_analysis_details.dish.id"] ?? null;

      if (!date || !dishId) return;

      const key = `${date}__${dishId}`;

      aiMap[key] = {
        predicted_waste_quantity:
          aiRecord["ai_analysis_details.predicted_waste_quantity"] ?? null,
        suggestion_note:
          aiRecord["ai_analysis_details.suggestion_note"] ?? null,
      };
    });

    // console.log("aiMap", aiMap);

    const result = resultDaily
      .filter(
        (record) =>
          record &&
          record["daily_operation.operation_date"] &&
          record["dish.id"] &&
          record["dish.name"]
      )
      .map((dailyRecord) => {
        const date = dailyRecord["daily_operation.operation_date"];
        const dishId = dailyRecord["dish.id"];
        const dishName = dailyRecord["dish.name"];

        const key = `${date}__${dishId}`;
        const aiData = aiMap[key] || null;

        // console.log("merge key:", key, "=>", aiData);

        return {
          date,
          dish_id: dishId,
          dish_name: dishName,
          quantity_prepared: Number(dailyRecord.quantity_prepared) || 0,
          quantity_used: Number(dailyRecord.quantity_used) || 0,
          quantity_wasted: Number(dailyRecord.quantity_wasted) || 0,
          waste_percentage: Number(dailyRecord.waste_percentage) || 0,
          waste_cost: Number(dailyRecord.waste_cost) || 0,
          predicted_waste_quantity: aiData?.predicted_waste_quantity ?? null,
          suggestion_note: aiData?.suggestion_note ?? null,
        };
      })
      .sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.dish_name || "").localeCompare(b.dish_name || "");
      });

    // console.log("merged result", JSON.stringify(result, null, 2));

    return res.json(ApiSuccess.getSelect("List waste by ingredient", result));
  } catch (error) {
    return next(error);
  }
};
