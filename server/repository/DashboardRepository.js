
const { DishModel, DailyOperationModel, DailyDetailModel, IngredientModel} = require('../models/index');
const sequelize = require('../config/connectData');
const { Op, fn, col } = require('sequelize');
class DashboardRepository {

    // tổng số lượng món ăn, tổng số đang phục vụ, tổng số đang đợi
    async getSumDishes(brandID) {
        const totalDishes = await DishModel.count({ where: { brand_id: brandID } });
        const totalServingDishes = await DishModel.count({ where: { brand_id: brandID, status: true } });
        const totalWaitingDishes = await DishModel.count({ where: { brand_id: brandID, status: false } });
        return {
            totalDishes,
            totalServingDishes,
            totalWaitingDishes
        }
    }
    // tổng số món ăn đã bán được trong tháng hiện tại


    async getPayDish1Month(brandID,month) {
    const result = await DailyDetailModel.findOne({
        attributes: [
            [fn('SUM', col('revenue_cost')), 'total_revenue'],
            [fn('SUM', col('waste_cost')), 'total_waste_cost'],
            [fn('SUM', col('quantity_prepared')), 'total_prepared'],
            [fn('SUM', col('quantity_wasted')), 'total_wasted']
        ],
        include: [
            {
                model: DailyOperationModel,
                required: true,
                attributes: [],
                where: {
                    brand_id: brandID,
                    operation_date: {
                        [Op.between]: [month.startDate,month.endDate]
                    }
                }
            }
        ],
        raw: true
    });

    return result;
    }
    // báo cáo phần trăm lãng phí của 7 ngày gần nhất
    async getPayDish7Day(brandID) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Lấy ngày cách đây 7 ngày
        const result = await DailyDetailModel.findOne({
            attributes: [
                [fn('SUM', col('waste_cost')), 'total_waste_cost'],
                [fn('SUM', col('quantity_prepared')), 'total_prepared'],
                [fn('SUM', col('quantity_wasted')), 'total_wasted']
            ],
            include: [
                {
                    model: DailyOperationModel,
                    attributes: [],
                    where: {
                        brand_id: brandID,
                        operation_date: {
                            [Op.gte]: sevenDaysAgo
                        }
                    }
                }
            ],
            raw: true
        });
        return result;
    }
    // báo cáo phần trăm lãng phí của ngày hôm qua
    async getPayDishYesterday(brandID) {
        const now = new Date();
        // Đầu ngày hôm nay (00:00)
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        // Đầu ngày hôm qua
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const result = await DailyDetailModel.findOne({
            attributes: [
                [fn('SUM', col('waste_cost')), 'total_waste_cost'],
                [fn('SUM', col('quantity_prepared')), 'total_prepared'],
                [fn('SUM', col('quantity_wasted')), 'total_wasted']
            ],
            include: [
                {
                    model: DailyOperationModel,
                    attributes: [],
                    where: {
                        brand_id: brandID,
                        operation_date: {
                            [Op.gte]: startOfYesterday, // >= 00:00 hôm qua
                            [Op.lt]: startOfToday       // < 00:00 hôm nay
                        }
                    }
                }
            ],
            raw: true
        });
        return result;
    }
    // thông báo nguyên liệu sắp hết
    async getLowStockIngredients(brandID) {
        const lowStockIngredients = await IngredientModel.findAll({
            where: {
                brand_id: brandID,
                current_stock: {
                    [Op.lt]: col('minimum_stock')
                }
            },
            attributes: ['id', 'name', 'current_stock', 'minimum_stock', 'unit']
        });
        return lowStockIngredients;
    }
    // lấy món dư nhiều nhất ngày hôm qua của 1 ngày
    async getPayDishYesterdayByDate(brandID) {
        const now = new Date();
        // Đầu ngày hôm nay (00:00)
        const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);
        // Đầu ngày hôm qua
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const result = await DailyDetailModel.findOne({
            attributes: ['id', 'quantity_wasted'],
            include: [
                {
                    model: DailyOperationModel,
                    attributes: [],
                    where: {
                        brand_id: brandID,
                        operation_date: {
                            [Op.gte]: startOfYesterday, // >= 00:00 hôm qua
                            [Op.lt]: startOfToday       // < 00:00 hôm nay
                        }
                    }
                }
            ],
            order: [['quantity_wasted', 'DESC']],
            raw: true
        });
        if(!result) return null;
        const ResutlDetail = await DailyDetailModel.findOne({
            attributes: ['id', 'quantity_prepared',
                [
                    sequelize.literal('(quantity_wasted / quantity_prepared) * 100'),
                    'quantity_percent'
                ]
            ],
            where: {
                id: result.id
            },
            include:[
                {
                    model: DishModel,
                    attributes: ['name']
                }
            ],
            raw: true
        });
        return {result, ResutlDetail};
    }
    async getWarningDishTableYesterday(brandID) {
    const now = new Date();

    // 00:00 hôm nay
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    // startOfToday.setDate(startOfToday.getDate()-6);

    // 00:00 hôm qua
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const result = await DailyDetailModel.findAll({
        attributes: [
            'id',
            'quantity_prepared',
            'quantity_wasted',
            'waste_cost',
            [
                sequelize.literal(`
                    ROUND(
                    (quantity_wasted::numeric / NULLIF(quantity_prepared, 0)::numeric) * 100,
                    1
                    )
                `),
                'waste_percent'
                ]
        ],
        include: [
            {
                model: DailyOperationModel,
                attributes: ["operation_date"],
                where: {
                    brand_id: brandID,
                    operation_date: {
                        [Op.gte]: startOfYesterday,
                        [Op.lt]: startOfToday
                    }
                }
            },
            {
                model: DishModel,
                attributes: ['name']
            }
        ],
        where: sequelize.literal(`
            (quantity_wasted  / NULLIF(quantity_prepared, 0)) * 100 > 10
        `),
        raw: true
    });

    return result;
}
}

module.exports = new DashboardRepository();