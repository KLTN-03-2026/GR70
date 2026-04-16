var express = require('express');
var router = express.Router();
const ManagerAllBrandController = require('../../controller/admin/ManagerAllBrandController');
const authorize = require('../../middleware/authorize');
/* GET users listing. */
router.get('/get-all-brand', authorize(["Admin"]), ManagerAllBrandController.getAllBrand);
router.get('/get-brand-detail/:brandID', authorize(["Admin"]), ManagerAllBrandController.getDetailBrand);
router.put('/unlock-brand/:brandID', authorize(["Admin"]), ManagerAllBrandController.unLockBrand);
router.put('/lock-brand/:brandID', authorize(["Admin"]), ManagerAllBrandController.lockBrand);
module.exports = router;