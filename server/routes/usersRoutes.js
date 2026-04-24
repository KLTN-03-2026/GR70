var express = require('express');
var router = express.Router();
var UserController = require('../controller/UserController');
const authorize = require('../middleware/authorize');
var CustomerController = require('../controller/kitchen/CustomerController');
/* GET users listing. */
// cập nhật số lượng khách hàng trong ngày
router.put('/update-customer-count',authorize(["Manager"]), CustomerController.UpdateCustomerCount);
router.get('/get-customer-count',authorize(["Manager"]), CustomerController.GetCustomerCount);
/* GET users listing. */
router.post('/register-kitchen/:id', authorize(["Manager", "Admin"]), UserController.RegisterKitchen);
// router.put('/update-kitchen/:id', UserController.UpdateKitchen);
router.get('/info', UserController.GetInfoUser);
router.put('/update-info', UserController.UpdateInfoUser);
router.put('/lock-kitchen/:id', authorize(["Manager", "Admin"]), UserController.LockKitchen);
router.put('/unlock-kitchen/:id', authorize(["Manager", "Admin"]), UserController.UnlockKitchen);
router.get('/get-kitchen-staff', authorize(["Manager"]), UserController.GetKitchenStaff);

module.exports = router;
