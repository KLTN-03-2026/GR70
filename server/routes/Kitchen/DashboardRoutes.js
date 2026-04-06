var express = require('express');
var router = express.Router();
const DashboardController = require('../../controller/kitchen/DashboardController');
const authorize = require('../../middleware/authorize');
/* GET users listing. */
router.get('/get-report-pay-yesterday', DashboardController.ReportPayYesterday);
router.get('/get-report-leftover-dishes', DashboardController.ReportLeftoverDishes);
router.get('/get-report-warning-dishes', DashboardController.ReportWarningDishTable);
module.exports = router;