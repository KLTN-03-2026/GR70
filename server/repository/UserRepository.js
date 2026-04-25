
const { UserModel, BrandModel, RoleModel } = require('../models/index');
const pagination = require('../utils/pagination');
class UserRepository {
    async InfoUser(id) {
        return await UserModel.findOne({
            where: { id: id },
            attributes: ['id', 'email', 'name', 'phone',"created_at"],
            include: [{
                model: BrandModel,
                attributes: ['name', 'address','province','status','rolebrand'],
            },{
                model: RoleModel,
                attributes: ['name'],
                through: { attributes: [] }
            }],
        });
    }
    // cập nhập thông tin
    async updateUser(id, data, options = {}) {
        return await UserModel.update(data, { where: { id: id }, ...options });
    }
    async updateBrand(id, data, options = {}) {
        return await BrandModel.update(data, { where: { id: id }, ...options });
    }
    // khóa hoặc mở khóa tài khoản
    async lockOrUnlockUser(id,reason, status) {
        return await UserModel.update({reason: reason, status: status}, { where: { id: id } });
    }
    // thông báo lý do khóa tài khoản
    async getNotifactionReason(id) {
        return await UserModel.findOne({
            where: { id: id },
            attributes: ['name','reason'],
        });
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