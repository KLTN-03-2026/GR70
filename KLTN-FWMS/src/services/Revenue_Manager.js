import api from "./api"

export const Sum_Revenue_yesterday = async () => {
    try{
        const res = await api.get("revenue/sum-revenue-yesterday");
        return res;

    }catch(error){
        throw console.log(error);
    }
}

export const Sum_Revenue_Month = async () => {
    try{
        const res = await api.get("revenue/sum-revenue-by-month");
        return res;
    }catch(error){
        throw console.log(error);
    }
}

export const Transaction_Revenue_Month = async () => {
    try{
        const res = await api.get("revenue/sum-revenue-transaction-by-month");
        return res;
    }catch(error){
        throw console.log(error);
    }
}