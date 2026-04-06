const cron = require('node-cron');
const CronServices = require("../services/CronServices");
const AIServices = require("../services/AIServices");
const OperationDaily = async () => {
    cron.schedule('0 1 * * *', async () => {
    // cron.schedule('* * * * *', async () => {
        try {
            const result = await CronServices.OperationDaily();
            console.log('[CRON] Xong:', result);
        } catch (error) {
            console.log(error);
        }
    });
}
const CallAIEveryDays= async () => {
    cron.schedule('0 3 * * *', async () => {
    // cron.schedule('* * * * *', async () => {
        try {
            const result = await AIServices.serviceAIEveryDays();
            console.log('[CRON] Xong AI:', result);
        } catch (error) {
            console.log(error);
        }
    });
}
module.exports = { OperationDaily, CallAIEveryDays };