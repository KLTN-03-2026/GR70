var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var database= require('./config/connectData');
var cors = require('./config/cors');
const {UserModel}= require('./models/index');
//middleware
var errorsHandler= require('./middleware/errorHandler');
var successHandler= require('./middleware/SuccessHandle');
var authenticate = require('./middleware/authenticate');
//routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRoutes');
var authRouter = require('./routes/authRoutes');
var ingredientRouter = require('./routes/ingredientRoutes');
var dishRouter = require('./routes/dishRoutes');
var KitchenRouter= require('./routes/Kitchen/DishRoutes');
var categoryRouter= require('./routes/categoryRoutes');
var DashboardRouter= require('./routes/dashboardRoutes');
var ConsumptionRouter = require('./routes/ConsumptionRoutes');
var HistoryWasteRouter= require('./routes/HistoryWasteRoutes');
var RevenueRouter = require('./routes/RevenueRoutes');
var DashboardKitchenRouter = require('./routes/Kitchen/DashboardRoutes');
var AdminDashboardRouter = require('./routes/admin/dashboardRoutes');
var ReportWasteRouter = require('./routes/reportWasteRoutes');
var ChatRouter = require('./routes/chatRoutes');
// cron
const { OperationDaily, CallAIEveryDays } = require('./routes/cron');
//test
var AuthController = require('./controller/AuthController');
var app = express();
app.use(cors);
//kết nối database
database.authenticate()
  .then(() => {
    console.log('✅ DB connected successfully');
  })
  .catch(err => {
    console.error('❌ DB connection error:', err);
  });
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/ping', (req, res) => {
  const user= UserModel.findByPk('94292bfd-19e8-4079-b67f-a2f22961738b');
  res.send('Server is alive ✅');
});
OperationDaily();
// CallAIEveryDays();

app.use('/api/auth', authRouter);
app.use(authenticate);
// api phải có token mới được truy cập
//....
app.use('/api/users', usersRouter);
app.use('/api/dashboard', DashboardRouter);
app.use('/api/dashboard/kitchen', DashboardKitchenRouter);
app.use('/api/ingredients', ingredientRouter);
app.use('/api/dishes', dishRouter);
app.use('/api', categoryRouter);
app.use('/api/consumption', ConsumptionRouter);
app.use('/api/history', HistoryWasteRouter);
app.use('/api/revenue', RevenueRouter);
app.use('/api/report-waste', ReportWasteRouter);
app.use('/api/chat', ChatRouter);
//kithen
app.use('/api/kitchen', KitchenRouter);
//admin
app.use('/api/admin/dashboard', AdminDashboardRouter);
app.use(successHandler);
app.use(errorsHandler);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
