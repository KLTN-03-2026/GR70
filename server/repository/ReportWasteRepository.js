const {
  DailyOperationModel,
  DailyDetailModel,
  DishModel,
  DishRecipeModel,
} = require("../models/index");
const sequelize = require("../config/connectData");
const { Op, fn,col, literal } = require("sequelize");
const { QueryTypes } = require("sequelize");
const { DailyOperation } = require("./DailyRepository");
class ReportWasteRepository {
  // tỉ lệ lãng phí nguyên liệu trong tháng (theo định mức món)
    async getPrecenIngredientByMonth(brandID, monthStart, monthEnd) {
        const preparedExpr = literal(
            `"daily_detail"."quantity_prepared" * "dish->dish_recipes"."quantity"::numeric`
        );

        const wastedExpr = literal(
            `"daily_detail"."quantity_wasted" * "dish->dish_recipes"."quantity"::numeric`
        );

        const rows = await DailyDetailModel.findAll({
            attributes: [
            [fn("COALESCE", fn("SUM", preparedExpr), 0), "total_prepared"],
            [fn("COALESCE", fn("SUM", wastedExpr), 0), "total_wasted"],
            ],
            include: [
            {
                model: DailyOperationModel,
                required: true,
                attributes: [],
                where: {
                brand_id: brandID,
                operation_date: { [Op.between]: [monthStart, monthEnd] },
                },
            },
            {
                model: DishModel,
                required: true,
                attributes: [],
                include: [
                {
                    model: DishRecipeModel,
                    required: true,
                    attributes: [],
                },
                ],
            },
            ],
            raw: true,
            subQuery: false,
        });

        const row = rows[0] || {};

        const totalPrepared = Number(row.total_prepared ?? 0);
        const totalWasted = Number(row.total_wasted ?? 0);
        const percentage = totalPrepared > 0 ? (totalWasted / totalPrepared) * 100 : 0;

        return {
            waste_percentage: Number(percentage.toFixed(2)),
            total_ingredient_prepared: totalPrepared,
            total_ingredient_wasted: totalWasted,
        };
    }

    async getTop5WastedIngredients(brandID, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // số ngày của kỳ hiện tại
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // kỳ trước: lùi đúng số ngày để so sánh xu hướng
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - diffDays + 1);

    const formatDate = (d) => d.toISOString().split("T")[0];

    const query = `
        WITH current_period AS (
        SELECT
            i.id AS ingredient_id,
            i.name AS ingredient_name,
            i.unit AS unit,
            SUM(dd.quantity_wasted * dr.quantity)::numeric AS total_wasted
        FROM daily_detail dd
        INNER JOIN daily_operations doo
            ON dd.daily_id = doo.id
        INNER JOIN dishes d
            ON dd.dishes_id = d.id
        INNER JOIN dish_recipes dr
            ON d.id = dr.dishes_id
        INNER JOIN ingredients i
            ON dr.ingredient_id = i.id
        WHERE doo.brand_id = :brandID
            AND doo.operation_date BETWEEN :startDate AND :endDate
        GROUP BY i.id, i.name, i.unit
        ),
        previous_period AS (
        SELECT
            i.id AS ingredient_id,
            SUM(dd.quantity_wasted * dr.quantity)::numeric AS total_wasted
        FROM daily_detail dd
        INNER JOIN daily_operations doo
            ON dd.daily_id = doo.id
        INNER JOIN dishes d
            ON dd.dishes_id = d.id
        INNER JOIN dish_recipes dr
            ON d.id = dr.dishes_id
        INNER JOIN ingredients i
            ON dr.ingredient_id = i.id
        WHERE doo.brand_id = :brandID
            AND doo.operation_date BETWEEN :prevStartDate AND :prevEndDate
        GROUP BY i.id
        )
        SELECT
        cp.ingredient_id,
        cp.ingredient_name,
        cp.unit,
        ROUND(cp.total_wasted, 2) AS wasted_amount,
        ROUND(COALESCE(pp.total_wasted, 0), 2) AS previous_wasted_amount,
        CASE
            WHEN COALESCE(pp.total_wasted, 0) = 0 AND cp.total_wasted > 0 THEN 100
            WHEN COALESCE(pp.total_wasted, 0) = 0 THEN 0
            ELSE ROUND(((cp.total_wasted - pp.total_wasted) / pp.total_wasted) * 100, 2)
        END AS trend_percent,
        CASE
            WHEN cp.total_wasted > COALESCE(pp.total_wasted, 0) THEN 'up'
            WHEN cp.total_wasted < COALESCE(pp.total_wasted, 0) THEN 'down'
            ELSE 'equal'
        END AS trend_direction
        FROM current_period cp
        LEFT JOIN previous_period pp
        ON cp.ingredient_id = pp.ingredient_id
        ORDER BY cp.total_wasted DESC
        LIMIT 5;
    `;

    const rows = await sequelize.query(query, {
        replacements: {
        brandID,
        startDate,
        endDate,
        prevStartDate: formatDate(prevStart),
        prevEndDate: formatDate(prevEnd),
        },
        type: QueryTypes.SELECT,
    });

    return rows.map((item) => ({
        ingredient_id: item.ingredient_id,
        ingredient_name: item.ingredient_name,
        wasted_amount: Number(item.wasted_amount),
        unit: item.unit,
        display_amount: `${Number(item.wasted_amount)} ${item.unit || ""}`.trim(),
        trend_percent: Number(item.trend_percent),
        trend_direction: item.trend_direction,
    }));
    }
    // doanh thu tổn thất trong 1 tháng
    async getRevenueLossByMonth(brandID, startDate, endDate) {
        return await DailyDetailModel.findAll({
            attributes: [
                [fn("SUM", col("waste_cost")), "total_waste_cost"],
            ],
            include: [
                {
                    model: DailyOperationModel,
                    required: true,
                    attributes: [],
                    where: {
                        brand_id: brandID,
                        operation_date: {
                            [Op.between]: [startDate, endDate],
                        },
                    },
                },
            ],
            raw: true,
        })
    }
    // tỉ lệ lãng phí món ăn giữa 2 tháng hiện tại và tháng trước
    async getWasteTrendByMonth(brandID, monthStart, monthEnd) {   
        const currentStart = new Date(monthStart);
        const currentEnd = new Date(monthEnd);

        // Tính khoảng tháng trước
        const prevMonthStart = new Date(currentStart);
        prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
        prevMonthStart.setDate(1);

        const prevMonthEnd = new Date(currentStart);
        prevMonthEnd.setDate(0); // ngày cuối của tháng trước

        // Lấy tổng món dư tháng hiện tại
        const currentRow = await DailyDetailModel.findOne({
            attributes: [
            [fn("COALESCE", fn("SUM", col("quantity_wasted")), 0), "total_wasted"],
            ],
            include: [
            {
                model: DailyOperationModel,
                required: true,
                attributes: [],
                where: {
                brand_id: brandID,
                operation_date: {
                    [Op.between]: [currentStart, currentEnd],
                },
                },
            },
            ],
            raw: true,
            subQuery: false,
        });

        // Lấy tổng món dư tháng trước
        const previousRow = await DailyDetailModel.findOne({
            attributes: [
            [fn("COALESCE", fn("SUM", col("quantity_wasted")), 0), "total_wasted"],
            ],
            include: [
            {
                model: DailyOperationModel,
                required: true,
                attributes: [],
                where: {
                brand_id: brandID,
                operation_date: {
                    [Op.between]: [prevMonthStart, prevMonthEnd],
                },
                },
            },
            ],
            raw: true,
            subQuery: false,
        });

        const currentWasted = Number(currentRow?.total_wasted ?? 0);
        const previousWasted = Number(previousRow?.total_wasted ?? 0);

        let trendPercent = 0;
        if (previousWasted === 0) {
            trendPercent = currentWasted > 0 ? 100 : 0;
        } else {
            trendPercent = ((currentWasted - previousWasted) / previousWasted) * 100;
        }

        let trendDirection = "equal";
        if (currentWasted < previousWasted) {
            trendDirection = "down";
        } else if (currentWasted > previousWasted) {
            trendDirection = "up";
        }

        return {
            // current_wasted: currentWasted,
            // previous_wasted: previousWasted,
            trend_percent: Number(trendPercent.toFixed(2)),
            trend_direction: trendDirection,
        };
    }
}

module.exports = new ReportWasteRepository();
