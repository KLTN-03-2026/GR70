
const DailyRepository = require("../repository/DailyRepository");
class HistoryWasteServices {
    async SummaryHistory7next(brandID){
        try {
            // lấy dữ liệu lịch sử 7 ngày gần nhất
            const history = await DailyRepository.GetHistory7NextDays(brandID);
            return history;
        }catch (error) {
            throw error;
        }
    }
    // lấy dữ liệu chi tiết các ngày gần nhất
    async DetailHistory3next(brandID){
        try {
            // lấy dữ liệu chi tiết các ngày gần nhất
            const history = await DailyRepository.GetDetailHistory3NextDays(brandID);
            return history;
        }catch (error) {
            throw error;
        }
    }
}

module.exports = new HistoryWasteServices();