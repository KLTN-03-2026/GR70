const {
  AiAnalysisModel,
  AiAnalysisDetailModel,
  DishModel,
} = require("../models/index");
const { Op } = require("sequelize");
class AIRepository {
  async createAi_Analysis(data, brandID, options = {}) {
    try {
      const createAi_Analysis = await AiAnalysisModel.create(
        { ...data, brand_id: brandID },
        { ...options },
      );
      return createAi_Analysis;
    } catch (error) {
      throw error;
    }
  }
  async createAi_Analysis_Detail(data, ai_analysis_id, options = {}) {
    try {
      const createAi_Analysis_Detail = await AiAnalysisDetailModel.create(
        { ...data, analysis_id: ai_analysis_id },
        { ...options },
      );
      return createAi_Analysis_Detail;
    } catch (error) {
      throw error;
    }
  }
  // láy dữ liệu phân tích của AI theo brandID
  async getAi_Analysis_By_BrandID(brandID) {
    try {
      const getAi_Analysis_By_BrandID = await AiAnalysisModel.findAll({
        where: {
          brand_id: brandID,
          date: new Date().toISOString().split("T")[0],
        },
        attributes: [],
        include: [
          {
            model: AiAnalysisDetailModel,
            attributes: [
              "id",
              "recommended_quantity",
              "predicted_waste_quantity",
              "suggestion_note",
            ],
            include: [
              {
                model: DishModel,
                attributes: ["name"],
              },
            ],
          },
        ],
      });
      return getAi_Analysis_By_BrandID;
    } catch (error) {
      throw error;
    }
  }
  // lấy dữ liệu phân tích của AI về số lượng khách hàng theo ngày
  async getAi_Analysis_Customer_By_BrandID(brandID) {
    try {
      const getAi_Analysis_Customer_By_BrandID = await AiAnalysisModel.findAll({
        where: {
          brand_id: brandID,
          date: new Date().toISOString().split("T")[0],
        },
        attributes: [
          "id",
          "date",
          "ai_customer_count",
          "summary",
          "risk_level",
        ],
      });
      return getAi_Analysis_Customer_By_BrandID;
    } catch (error) {
      throw error;
    }
  }
  // danh sách lãng phí món ăn hằng ngày mà AI phân tích trong 1 tháng
  async getAi_Analysis_Waste_By_BrandID(brandID) {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );
    const lastDayOfNextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1,
    );

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const result = await AiAnalysisModel.findAll({
      where: {
        brand_id: brandID,
        date: {
          [Op.gte]: formatDate(firstDayOfMonth),
          [Op.lt]: formatDate(lastDayOfNextMonth),
        },
      },
      attributes: ["id", "date"],
      include: [
        {
          model: AiAnalysisDetailModel,
        //   as: "ai_analysis_details",
          attributes: ["id","predicted_waste_quantity", "suggestion_note"],
          include: [
            {
              model: DishModel,
              attributes: ["id","name"],
            },
          ],
        },
      ],
      raw: true,
    });
    return result;
  } catch (error) {
    throw error;
  }
}
}

module.exports = new AIRepository();
