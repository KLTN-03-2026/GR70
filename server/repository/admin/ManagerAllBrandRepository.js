const {BrandModel, UserModel,DishModel,DailyOperationModel,DailyDetailModel,RoleModel} = require("../../models/index");
const { Op } = require('sequelize');
class ManagerAllBrandRepository {
    async getAllBrand() {
        return await BrandModel.findAll({
            attributes: ['id', 'name', 'address', 'province', 'status','rolebrand'],
            include: [{
                model: UserModel,
                attributes: ['name'],
                include: [{
                    model: RoleModel,
                    attributes: [],
                    where: { name: "Manager" }
                }]
            }]
        });
    }
    async getDetailBrand(id) {
        return await BrandModel.findOne({
            where: { id: id },
            attributes: ['id', 'name', 'address', 'province', 'status','rolebrand'],
            include: [{
                model: UserModel,
                attributes: ['name', 'email', 'phone', 'address', 'status','created_at'],
                include: [{
                    model: RoleModel,
                    attributes: [],
                    where: { name: "Manager" }
                }]
            }]
        });
    }
    async SumDishBrand(id) {
        return await DishModel.count({ where: { brand_id: id, status: true} });
    }
    async SumRevenueYearBrand(id, year) {
        const start = new Date(`${year}-01-01`);
        const end = new Date(`${year}-12-31 23:59:59`);

        return await DailyOperationModel.sum('daily_details.revenue_cost', {
            where: {
                brand_id: id,
                operation_date: {
                    [Op.between]: [start, end]
                }
            },
            include: [{
                model: DailyDetailModel,
                as: 'daily_details',
                attributes: []
            }]
        });
    }
    async lockBrand(id) {
        return await BrandModel.update({ status: false }, { where: { id: id } });
    }
    async unlockBrand(id) {
        return await BrandModel.update({ status: true }, { where: { id: id } });
    }
    async checkStatusBrand(id) {
        return await BrandModel.findOne({attributes: ['status'], where: { id: id}, raw: true});
    }
}

module.exports = new ManagerAllBrandRepository();