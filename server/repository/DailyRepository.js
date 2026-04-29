const {
  DailyOperationModel,
  DailyDetailModel,
  DishModel,
  DishCategoryModel,
} = require("../models/index");
const sequelize = require("../config/connectData");
const { Op, fn, col } = require("sequelize");
const pagination = require("../utils/pagination");
const { log } = require("winston");
class DailyRepository {
  async checkDailyOperation(brandID, datevn) {
    return await DailyOperationModel.findOne({
      where: {
        brand_id: brandID,
        operation_date: datevn,
      },
      raw: true,
    });
  }
  async DailyOperation(brandID, datevn) {
    return await DailyOperationModel.create({
      brand_id: brandID,
      operation_date: datevn,
      customer_count: 0,
    },
    {
      raw: true,
    });
  }
  async TakeIDOperation(brandID) {
    const today = new Date().toISOString().split("T")[0];
    const operation = await DailyOperationModel.findOne({
      where: {
        brand_id: brandID,
        operation_date: today,
      },
    });
    if (!operation) {
      return null;
    }
    return operation.id;
  }
  // lấy chi tiết daily detail
  async GetDishesOutputByID(id) {
    return await DailyDetailModel.findByPk(id);
  }
  // tạo daily_detail
  async CreateDishesOutput(data, dailyID, option = {}) {
    return await DailyDetailModel.create(
      {
        daily_id: dailyID,
        dishes_id: data.dishes_id,
        quantity_prepared: data.quantity_prepared,
        revenue_cost: data.revenue_cost,
      },
      { ...option },
    );
  }
  // cập nhập món dư
  async UpdateDishesLeftoverOutput(data, DailyDetailID) {
    return await DailyDetailModel.update(
      {
        quantity_wasted: data.quantity_wasted,
        waste_cost: data.wasted_cost,
        revenue_cost: data.revenue_cost,
      },
      { where: { id: DailyDetailID } },
    );
  }
  // cập nhập món ra khi có món dư
  async UpdateDishesOutput(data, DailyDetailID, option = {}) {
    return await DailyDetailModel.update(
      {
        quantity_prepared: data.quantity_prepared,
        revenue_cost: data.revenue_cost,
      },
      { where: { id: DailyDetailID }, ...option },
    );
  }
  // lấy danh sách món ra theo ngày
  async GetDishesOutputByDate(dailyID,options) {
    const test =await pagination.getPagination({
      model: DailyDetailModel,
      attributes: [
        "id",
        "quantity_prepared",
        "quantity_wasted",
        "revenue_cost",
        "waste_cost",
      ],
      where: { daily_id: dailyID },
      include: [
        {
          model: DishModel,
          attributes: ["name"],
          include: [
            {
              model: DishCategoryModel,
              attributes: ["name"],
            }
          ]
        },
      ],
      ...options
    })
    return test
  }
  // kiểm tra xem món ăn đó đã được tạo món ra trong ngày chưa, nếu có rồi thì không được tạo nữa
  async CheckDishesOutputByDishID(dishes_id, dailyID) {
    return await DailyDetailModel.findOne({
      where: { dishes_id: dishes_id, daily_id: dailyID },
    });
  }
  // cập nhập số lượng khách hàng trong ngày
  async UpdateCustomerCount(DailyID, customer_count) {
    return await DailyOperationModel.update(
      { customer_count: customer_count },
      { where: { id: DailyID } },
    );
  }
  // lấy dữ liệu lịch sử 7 ngày gần nhất
  async GetHistory7NextDays(brandID) {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const startDate = sevenDaysAgo.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    // 1. Trung bình số khách trong 7 ngày
    const avgCustomer = await DailyOperationModel.findOne({
      where: {
        brand_id: brandID,
        operation_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [[fn("AVG", col("customer_count")), "avg_customer_count"]],
      raw: true,
    });

    // 2. Trung bình các field của DailyDetail trong 7 ngày
    const avgDetail = await DailyDetailModel.findOne({
      include: [
        {
          model: DailyOperationModel,
          attributes: [],
          where: {
            brand_id: brandID,
            operation_date: {
              [Op.between]: [startDate, endDate],
            },
          },
        },
      ],
      attributes: [
        [fn("AVG", col("quantity_prepared")), "avg_quantity_prepared"],
        [fn("AVG", col("quantity_wasted")), "avg_quantity_wasted"],
      ],
      raw: true,
    });
    return {
      avg_customer_count: Number(avgCustomer?.avg_customer_count || 0),
      avg_quantity_prepared: Number(avgDetail?.avg_quantity_prepared || 0),
      avg_quantity_wasted: Number(avgDetail?.avg_quantity_wasted || 0),
    };
  }
  // lấy dữ liệu chi tiết các ngày gần nhất
  async GetDetailHistory3NextDays(brandID) {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 2);

    const startDate = threeDaysAgo.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const result = await DailyDetailModel.findAll({
      attributes: ["quantity_prepared", "quantity_wasted", "waste_cost"],
      include: [
        {
          model: DailyOperationModel,
          attributes: ["operation_date"],
          where: {
            brand_id: brandID,
            operation_date: {
              [Op.between]: [startDate, endDate],
            },
          },
        },
        {
          model: DishModel,
          attributes: ["name"],
        },
      ],
      raw: true,
    });

    return result;
  }
  // lấy dữ liệu tổng số khách trong 1 tháng và so phần trăm với tháng trước
  async GetCustomerCountByMonth(brandID) {
  const today = new Date();

  const formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Current month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const currentStartDate = formatDateLocal(firstDayOfMonth);
  const currentEndDate = formatDateLocal(lastDayOfMonth);

  // Previous month
  const firstDayPrevMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );
  const lastDayPrevMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    0
  );

  const prevStartDate = formatDateLocal(firstDayPrevMonth);
  const prevEndDate = formatDateLocal(lastDayPrevMonth);

  // Get total customer count for current month
  const currentMonthResult = await DailyOperationModel.findOne({
    attributes: [[fn("SUM", col("customer_count")), "total_customers"]],
    where: {
      brand_id: brandID,
      operation_date: {
        [Op.between]: [currentStartDate, currentEndDate],
      },
    },
    raw: true,
  });

  // Get total customer count for previous month
  const prevMonthResult = await DailyOperationModel.findOne({
    attributes: [[fn("SUM", col("customer_count")), "total_customers"]],
    where: {
      brand_id: brandID,
      operation_date: {
        [Op.between]: [prevStartDate, prevEndDate],
      },
    },
    raw: true,
  });

  const currentTotal = Number(currentMonthResult?.total_customers || 0);
  const prevTotal = Number(prevMonthResult?.total_customers || 0);

  let percentageChange = 0;
  if (prevTotal > 0) {
    percentageChange = ((currentTotal - prevTotal) / prevTotal) * 100;
  } else if (currentTotal > 0) {
    percentageChange = 100;
  }

  return {
    current_month_total: currentTotal,
    previous_month_total: prevTotal,
    percentage_change: Math.round(percentageChange * 100) / 100,
  };
}
  // danh sách số lượng khách trong 1 tháng có cả doanh thu
  async GetCustomerCountAndRevenueByMonth(brandID, month) {
    const result = await DailyOperationModel.findAll({
      attributes: [
        "id",
        "operation_date",
        "customer_count",
        [fn("SUM", col("daily_details.revenue_cost")), "total_revenue"],
      ],
      where: {
        brand_id: brandID,
        operation_date: {
          [Op.between]: [month.startDate,month.endDate],
        },
      },
      include: [
        {
          model: DailyDetailModel,
          attributes: [],
          as: "daily_details",
        },
      ],
      group: [
        col("daily_operations.id"),
        col("daily_operations.operation_date"),
        col("daily_operations.customer_count"),
      ],
      raw: true,
    });

    return result;
  }
  // danh sách món ăn bán ra ngày hôm qua
  async GetDishesOutputByLastDate(brandID,operation_date,caterogy,options) {
    let startDate, endDate;

    if (operation_date) {
      // Nếu có truyền vào thì dùng đúng ngày đó
      startDate = operation_date;
      endDate = operation_date;
    } else {
      // Không có thì lấy hôm qua -> hôm nay
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      startDate = yesterday.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    }

    const result = await pagination.getPagination({
      model: DailyDetailModel,
      attributes: [
        "id",
        "quantity_prepared",
        "quantity_wasted",
        [
          sequelize.literal(
            "(quantity_wasted / NULLIF(quantity_prepared, 0)) * 100",
          ),
          "waste_percentage",
        ],
      ],
      include: [
        {
          model: DailyOperationModel,
          attributes: ["operation_date"],
          where: {
            brand_id: brandID,
            operation_date: {
              [Op.between]: [startDate, endDate],
            },
          },
        },
        {
          model: DishModel,
          attributes: ["name"],
          where:{
            dish_category_id: {
              [Op.ne]: caterogy || null
            }
          }
        },
      ],
      ...options
    });
    return result;
  }
  // tổng số lảng phí mon ăn trong 1 tháng (nếu ko truyền month thì lấy tháng hiện tại)
async SumWasteByMonth(brandID, month = null) {
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
    ],
    include: [
      {
        model: DailyOperationModel,
        attributes: [], // rất quan trọng
        required: true,
        where: {
          brand_id: brandID,
          operation_date: {
            [Op.gte]: formatDate(firstDayOfMonth),
            [Op.lt]: formatDate(firstDayOfNextMonth),
          },
        },
      },
    ],
    raw: true,
  });
  return result;
}
  // danh sách lãng phí món ăn theo nguyên liệu
  async ListWasteByIngredient(brandID, month) {
    const result = await DailyDetailModel.findAll({
      attributes: [
        "id",
        "quantity_prepared",
        "quantity_wasted",
        "waste_cost",
        [
          sequelize.literal(
            "(quantity_wasted / NULLIF(quantity_prepared, 0)) * 100",
          ),
          "waste_percentage",
        ],
        [
          sequelize.literal("quantity_prepared - quantity_wasted"),
          "quantity_used",
        ],
      ],
      include: [
        {
          model: DailyOperationModel,
          attributes: ["operation_date"],
          where: {
            brand_id: brandID,
            operation_date: {
              [Op.between]: [month.startDate, month.endDate],
            },
          },
        },
        {
          model: DishModel,
          attributes: ["id","name"],
        },
      ],
      raw: true,
    });
    return result;
  }
  // tổng doanh thu hôm qua
  async SumRevenueYesterday(brandID) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // format YYYY-MM-DD (local time, không bị lệch)
            const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
            };
    const result = await DailyDetailModel.findOne({
      attributes: [[fn("SUM", col("revenue_cost")), "total_revenue"]],
      include: [
        {
          model: DailyOperationModel,
          attributes: [],
          required: true,
          where: {
            brand_id: brandID,
            operation_date: formatDate(yesterday),
          },
        },
      ],
      raw: true,
    });
    return result;
  }
  //tổng doanh thu tháng
  async SumRevenueByMonth(brandID,month) {
    const result = await DailyDetailModel.findOne({
      attributes: [[fn("SUM", col("revenue_cost")), "total_revenue"]],
      include: [
        {
          model: DailyOperationModel,
          attributes: [],
          required: true,
          where: {
            brand_id: brandID,
            operation_date: {
              [Op.between]: [month.startDate,month.endDate],
            },
          },
        },
      ],
      raw: true,
    });
    return result;
  }
  // chi tiết giao dịch tháng này
  async TransactionByMonth(brandID,month,date,options) {
    const operationWhere = {
    brand_id: brandID,
  };
  if (date) {
    operationWhere.operation_date = date; 
    // hoặc nếu date có giờ thì nên dùng khoảng:
    // operationWhere.operation_date = {
    //   [Op.between]: [dayjs(date).startOf('day'), dayjs(date).endOf('day')]
    // };
  } else {
    operationWhere.operation_date = {
      [Op.between]: [month.startDate, month.endDate],
    };
  }
    const result = await pagination.getPagination({
      model: DailyDetailModel,
      attributes: ["id","revenue_cost",
        [
          sequelize.literal("quantity_prepared - quantity_wasted"),
          "quantity_used",
        ],
      ],
      include: [
        {
          model: DailyOperationModel,
          attributes: ["operation_date"],
          required: true,
          where: operationWhere,
        },{
          model: DishModel,
          attributes: ["name"],
        }
      ],
      ...options
    });
    return result;
  }
  //lấy số lượng khách hàng hằng ngày
  async GetCustomerCount(brandID) {
    return await DailyOperationModel.findOne({
      attributes: ["customer_count"],
      where: {
         brand_id: brandID, 
         operation_date: new Date().toISOString().split("T")[0]
         } 
    });
  }
}

module.exports = new DailyRepository();
