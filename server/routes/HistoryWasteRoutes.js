var express = require('express');
var router = express.Router();
const HistoryWasteController = require('../controller/HistoryWasteController');
router.get('/sum-waste-by-month', HistoryWasteController.SumWasteByMonth);
router.get('/sum-waste-by-month-compare', HistoryWasteController.SumWasteByMonthCompare);
router.get('/list-waste-by-ingredient', HistoryWasteController.ListWasteByIngredient);
module.exports = router;