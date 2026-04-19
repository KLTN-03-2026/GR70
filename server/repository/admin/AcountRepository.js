const {UserModel, RoleModel, BrandModel} = require("../../models/index");
const pagination = require("../../utils/pagination");
class AcountRepository {
    async SumAccount(){
        const count = await UserModel.count({where: {status: true}})
        return count-1
    }
    async SumKitchen(){
        return await UserModel.count(
            {where: {status: true},
            include: [
                {
                    model: RoleModel,
                    where: {name: "Kitchen"}
                }
            ]})
    }
    async SumManager(){
        return await UserModel.count(
            {where: {status: true},
            include: [
                {
                    model: RoleModel,
                    where: {name: "Manager"}
                }
            ]})
    }
    async SumBrand(){
        return await BrandModel.count({where: {status: true}})
    }
    async getListBrand (options){
        return await pagination.getPagination({
            model: BrandModel,
            attributes: ['id','name', 'status','rolebrand'],
            include: [{
                    model: UserModel,
                    attributes: ['name', 'email'],
                    include: [{
                        model: RoleModel,
                        attributes: [],
                        where: { name: "Manager" } 
                    }]
                }],
            orderClaude: [[UserModel, 'created_at', "DESC"]],
            ...options
        })
    }
}

module.exports = new AcountRepository()