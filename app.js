/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
var secure = require('./routes/secure');
var fs = require('fs');
var app = express();
var cryptico = require('./routes/RSA');
var order = require('./routes/order');


app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});
app.configure('development', function(){
	app.use(express.errorHandler());
});

server = http.createServer(app).listen(3000, function(){
  console.log("Express server listening on port " + 3000);
});


app.get('/', function(req, res){res.render('index')});
app.get('/checkLoginStatus', secure.checkLoginStatus);
app.get('/Purchaser', function(req, res){res.render('index')});
app.get('/Supervisor', function(req, res){res.render('index')});
app.get('/OrdersDepartment', function(req, res){res.render('index')});
app.get('/Purchaser/Orders', order.getPurchaserOrders);
app.get('/Supervisor/Orders', order.getSupervisorOrders);
app.get('/Purchaser/AcknowledgingOrders', function(req, res){res.render('index')});

app.post('/Purchaser/SendOrder', order.purchaserSendOrder);
app.get('/Purchaser/getOrderNumber', order.getOrderNumber);
app.get('/Purchaser/getPurchasedOrder', order.getPurchasedOrder);

app.get('/Supervisor/getVerifiedOrder', order.getVerifiedOrder);
app.post('/Supervisor/removePurchaserToSupervisorOrder', order.removePurchaserToSupervisorOrder);
app.post('/Supervisor/sendVerifiedOrder', order.sendVerifiedOrder);

app.get('/OrdersDepartment/getWaitedOrder', order.getWaitedOrder);
app.post('/OrdersDepartment/removeSupervisorToOrdersDepartmentOrder', order.removeSupervisorToOrdersDepartmentOrder);
app.post('/OrdersDepartment/sendPurchasedOrder', order.sendPurchasedOrder);
app.get('/OrdersDepartment/PurchasedOrders', order.getPurchasedOrders);

app.get('/Purchaser/PrivateKey', secure.getKey);
app.post('/Purchaser/PrivateKey', secure.postPrivateKey);
app.get('/OrdersDepartment/PrivateKey', secure.getKey);
app.post('/OrdersDepartment/PrivateKey', secure.postPrivateKey);
app.get('/Supervisor/PrivateKey', secure.getKey);
app.post('/Supervisor/PrivateKey', secure.postPrivateKey);
app.get('/users', user.list);
app.get('/hey', secure.test);
app.post('/ho', function(req, res) {
    res.send('HO!');
});
app.get('/login', secure.userLogin);