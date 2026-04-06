import api from "./api"

export const getAll_Dish = async () => {
    try {
        const res = await api.get("/kitchen/get-all-dishes");
        return res.data;
    } catch (error) {
        throw console.log(error);
    }
}

export const Create_Dish_Kitchen = async (data) => {
    try {
        const res = await api.post("/kitchen/create-dishes-new", data);
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