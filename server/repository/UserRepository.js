
const { UserModel, BrandModel, RoleModel } = require('../models/index');
const pagination = require('../utils/pagination');
class UserRepository {
    async InfoUser(id) {
        return await UserModel.findOne({
            where: { id: id },
            attributes: ['id', 'email', 'name', 'phone', 'address',"created_at"],
            include: [{
                model: BrandModel,
                attributes: ['name', 'address'],
            }],
        });
    }
    // khóa hoặc mở khóa tài khoản
    async lockOrUnlockUser(id, status) {
        return await UserModel.update({status: status}, { where: { id: id } });
    }
    // lấy danh sách nhân viên role Kitchen
    async getKitchenStaff(brandID, options) {
        return await pagination.getPagination({
            model: UserModel,
            where: { brand_id: brandID },
            attributes: ['id', 'name', 'email', 'phone', 'address', 'status', "created_at"],
            include: [{
                model: BrandModel,
                attributes: ['id'],
            },{
                model: RoleModel,
                attributes:[],
                where:{name: "Kitchen"},
            }],
            ...options
        });
    }
}

module.exports = new UserRepository();