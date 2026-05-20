import api from "./api"

export const getAll_Dish = async (page = 1, limit = 15) => {
    try {
        return await api.get(`dishes/get-all-dishes?page=${page}&size=${limit}`);
    } catch (error) {
        throw console.log(error);
    }
}

export const Create_Dish_Kitchen = async (data) => {
    try {
        const res = await api.post("kitchen/create-dishes-new", data);
        return res.data;
    } catch (error) {
        throw console.log(error);
        
    }
};

export const List_Dish_Await = async () => {
    try{
        const res = await api.get("kitchen/get-all-dishes-false-by-kitchen")
        return res.data;
    }catch(error){
        throw console.log(error);
    }
}