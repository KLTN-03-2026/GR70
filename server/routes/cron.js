const cron = require('node-cron');
const CronServices = require("../services/CronServices");
const AIServices = require("../services/AIServices");
const OperationDaily = async () => {
    cron.schedule('0 1 * * *', async () => {
    // cron.schedule('* * * * *', async () => {
        try {
            const result = await CronServices.OperationDaily();
            // console.log('[CRON] Xong:', result);
        } catch (error) {
            console.log(error);
        }
    },{
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });
}
const CallAIEveryDays= async () => {
    cron.schedule('0 2 * * *', async () => {
    // cron.schedule('* * * * *', async () => {
        try {
            const result = await AIServices.serviceAIEveryDays();
            // console.log('[CRON] Xong AI:', result);
        } catch (error) {
            console.log(error);
        }
    },{
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });
}
module.exports = { OperationDaily, CallAIEveryDays };