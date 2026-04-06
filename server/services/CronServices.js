const DailyRepository = require("../repository/DailyRepository");
const BrandRepository = require("../repository/CheckRepostory");
class CronServices {
    async OperationDaily() {
        const AllBrand = await BrandRepository.AllBrand();
        if(!AllBrand || AllBrand.length === 0){
            throw new Error("Không có brand nào");
        }
        const dataDate= new Date();
        await Promise.all(
            AllBrand.map(async (brand) => {
                await DailyRepository.DailyOperation(brand.id, dataDate);
            })
        );
        return "Daily operation completed successfully";
    }
}

module.exports = new CronServices();