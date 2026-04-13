const { BrandModel, UserModel, RoleModel,DailyOperationModel,DailyDetailModel } = require("../models/index");
const { Op, fn, col, literal } = require("sequelize");
class DashboardAdminRepository {
  async getBrandActive() {
    return await BrandModel.findAll({ where: { status: true } });
  }
  async CountBrandActive() {
    return await BrandModel.count({ where: { status: true } });
  }
  async CountUserActive() {
    return await UserModel.count({
      where: { status: true },
      include: [
        {
          model: RoleModel,
          where: { name: "Kitchen" || "Manager" },
        },
      ],
    });
  }
  // tổng số lảng phí mon ăn trong 1 tháng (nếu ko truyền month thì lấy tháng hiện tại)
  async precentWasteDishOnMonth( month = null) {
    const now = new Date();
    let year = now.getFullYear();
    let monthIndex = now.getMonth(); // 0-11

    if (month !== null) {
      if (typeof month === "object") {
        year = month.year ?? year;
        monthIndex = month.month ?? monthIndex;
      } else if (typeof month === "number") {
        monthIndex = month;
      }
    }

    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const firstDayOfNextMonth = new Date(year, monthIndex + 1, 1);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const result = await DailyDetailModel.findOne({
      attributes: [
        [fn("COALESCE", fn("SUM", col("quantity_wasted")), 0), "total_waste"],
        [fn("COALESCE", fn("SUM", col("quantity_prepared")), 0), "total_prepared"],
      ],
      include: [
        {
          model: DailyOperationModel,
          attributes: [], // rất quan trọng
          required: true,
          where: {
            operation_date: {
              [Op.gte]: formatDate(firstDayOfMonth),
              [Op.lt]: formatDate(firstDayOfNextMonth),
            },
          },
        },
      ],
      raw: true,
    });
    const total_waste = Number(result?.total_waste ?? 0);
    const total_prepared = Number(result?.total_prepared ?? 0);
    const precent = ((total_waste / total_prepared) * 100).toFixed(2);
    return precent;
  }
  // lấy lãng phí cao nhất trong 1 tháng của từng cửa hàng
  async ReportBrandWasteDish(value) {
    const date = await this.handleSetMonth();

    return await DailyDetailModel.findAll({
      attributes: [
        [col("daily_operation.brand_id"), "brand_id"],
        [col("daily_operation->brand.name"), "brand_name"],
        [fn("COALESCE", fn("SUM", col("quantity_wasted")), 0), "total_waste"],
        [fn("COALESCE", fn("SUM", col("quantity_prepared")), 0), "total_prepared"],
        [
          literal(`
            CASE
              WHEN SUM(quantity_prepared) = 0 THEN 0
              ELSE (SUM(quantity_wasted) * 100.0 / SUM(quantity_prepared))
            END
          `),
          "total_percent"
        ],
      ],
      include: [
        {
          model: DailyOperationModel,
          attributes: [],
          required: true,
          where: {
            operation_date: {
              [Op.gte]: date.firstDayOfMonth,
              [Op.lt]: date.firstDayOfNextMonth,
            },
          },
          include: [
            {
              model: BrandModel,
              attributes: ["address","province"],
              required: true,
            },
          ],
        },
      ],
      group: [
        col("daily_operation.brand_id"),
        col("daily_operation->brand.id"),
        col("daily_operation->brand.name"),
      ],
      having: literal(`
        CASE
          WHEN SUM(quantity_prepared) = 0 THEN 0
          ELSE (SUM(quantity_wasted) * 100.0 / SUM(quantity_prepared))
        END > ${value?value:15} 
      `),
      raw: true,
    });
}
  async handleSetMonth(month){
    const now = new Date();
    let year = now.getFullYear();
    let monthIndex = now.getMonth(); // 0-11

    if (month !== null) {
      if (typeof month === "object") {
        year = month.year ?? year;
        monthIndex = month.month ?? monthIndex;
      } else if (typeof month === "number") {
        monthIndex = month;
      }
    }

    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const firstDayOfNextMonth = new Date(year, monthIndex + 1, 1);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };
    return {
      firstDayOfMonth: formatDate(firstDayOfMonth),
      firstDayOfNextMonth: formatDate(firstDayOfNextMonth)
    }
  }
}
module.exports = new DashboardAdminRepository();
