var express = require('express');
var router = express.Router();
const RevenueController = require('../controller/RevenueController');
const authorize = require('../middleware/authorize');
/* GET users listing. */
router.get('/sum-revenue-by-month',authorize(["Manager"]), RevenueController.SumRevenueByMonth);
router.get('/sum-revenue-yesterday',authorize(["Manager"]), RevenueController.SumRevenueYesterday);
router.get("/sum-revenue-transaction-by-month",authorize(["Manager"]), RevenueController.TransactionByMonth);

module.exports = router;