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
    async DetailManager(id){
        return await BrandModel.findOne({
            attributes:[],
            where: {id: id},
            include: [{
                model: UserModel,
                attributes: ['name', 'email','phone','address','status','created_at'],
                include: [{
                    model: RoleModel,
                    attributes: [],
                    where: { name: "Manager" }
                }]
                
            }]
        })
    }
    async DetailKitchen(id){
        return await BrandModel.findOne({
            attributes:[],
            where: {id: id},
            include: [{
                model: UserModel,
                attributes: ['name', 'email','phone','address','status','created_at'],
                include: [{
                    model: RoleModel,
                    attributes: [],
                    where: { name: "Kitchen" }
                }]
            }]
        })
    }
}

module.exports = new AcountRepository()