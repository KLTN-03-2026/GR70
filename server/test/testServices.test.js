const DailyServices = require("../services/DailyServices");
test('should throw error when something wrong', async () => {
  await expect(
    DailyServices.checkDailyOperation("45c39537-d593-40cc-8958-e15a3658a917")
  ).rejects.toThrow();
});