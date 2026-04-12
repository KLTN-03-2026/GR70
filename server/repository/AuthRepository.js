const {UserModel, UserRoleModel, BrandModel, RoleModel, RefreshTokenModel} = require('../models/index');
class AuthRepository{
    async SelectMail (email){
        return await UserModel.findOne({
            where: {email: email},
            attributes: ['id', 'email', 'name', "password"],
            include: [{
                model: RoleModel,
                attributes: ['name'],
                through: { attributes: [] } 
            },{
                model: BrandModel,
                attributes: ['id'],
            }],
        });
    }
    async createUser (data, brandID,options = {}){
        return await UserModel.create({...data, brand_id: brandID}, { ...options});
    }
    async createBrand(data,options = {}){
        return await BrandModel.create(data,{raw: true, nest: true, ...options});
    }
    async createRole(userId, roleId,options = {}){
        return await UserRoleModel.create({user_id: userId, role_id: roleId},{...options});
    }
    async updateUser(data, id, options = {}) {
        return await UserModel.update({name: data.name, email: data.email, phone: data.phone, address: data.address}, { where: { id: id }, ...options });
    }
    // xóa refresh token
    async deleteRefreshToken(id) {
        return await RefreshTokenModel.destroy({where: {user_id: id}});
    }
    // lưu refresh token
    async saveRefreshToken(token, id) {
        return await RefreshTokenModel.create({token: token, user_id: id});
    }
    // kiểm tra refresh token
    async checkRefreshToken(id) {
        return await RefreshTokenModel.findOne({where: {user_id: id}});
    }
    // check user active
    async checkUserActive(id) {
        return await UserModel.findOne({
            where: {id: id, status: true},
            attributes:["status"],
            include: [{
                model: RoleModel,
                attributes: ['name'],
            },{
                model: BrandModel,
                attributes: ['id'],
            }],
        });
    }
    async checkUserAdmin(mail) {
        return await UserModel.findOne({
            where: {email: mail},
            attributes: ['id', 'email', 'name', "password"],
            include: [{
                model: RoleModel,
                attributes: ['name'],
                through: { attributes: [] } 
            }],
        });
    }
    // danh sách list kitchen cùng brand
    async getKitchenList(brandID) {
        return await UserModel.findAll({
            where: { brand_id: brandID, status: true },
            attributes: ['id'],
            include: [{
                model: RoleModel,
                where:{name: "Kitchen"},
            }],
        });
    }
}
module.exports =  new AuthRepository();