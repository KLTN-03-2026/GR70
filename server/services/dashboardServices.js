const DashboardRepository = require('../repository/DashboardRepository');
const ApiError = require("../utils/ApiError");

class DashboardServices{
    // lấy tổng số lượng món ăn đã bán được trong tháng hiện tại
    async getSumDishes(brandID){
        try {
            const reportDishes = await DashboardRepository.getSumDishes(brandID);
            return reportDishes;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new DashboardServices();