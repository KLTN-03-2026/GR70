const ApiError = require("../utils/ApiError");
const DishesRepository = require("../repository/DishesRepository");

class DailyServices {
    // check giá món ăn
    async checkPriceDish(dishes_id){
        try {
            const dish = await DishesRepository.GetPriceDishByID(dishes_id);
            if(!dish){
                throw ApiError.NotFound("Dish not found");
            }
            return dish;
        } catch (error) {
            throw error
        }
    }
    // xét tháng
    async checkMonth() {
        try {
            const today = new Date();

            const firstDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
            );

            const lastDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
            );

            // format YYYY-MM-DD (local time, không bị lệch)
            const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
            };

            return {
            startDate: formatDate(firstDayOfMonth),
            endDate: formatDate(lastDayOfMonth),
            };
        } catch (error) {
            throw error;
        }
        }
}

module.exports = new DailyServices();