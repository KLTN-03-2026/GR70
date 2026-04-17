const DailyRepository = require("../repository/DailyRepository");
const BrandRepository = require("../repository/CheckRepostory");
class CronServices {
    async OperationDaily() {
        const AllBrand = await BrandRepository.AllBrand();
        if(!AllBrand || AllBrand.length === 0){
            throw new Error("Không có brand nào");
        }
        const vnDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
            }).format(new Date());
        await Promise.all(
            AllBrand.map(async (brand) => {
                await DailyRepository.DailyOperation(brand.id, vnDate);
            })
        );
        return "Daily operation completed successfully";
    }
}

module.exports = new CronServices();