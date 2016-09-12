var database = require('./database');
var db = require('./database').db;


exports.getOrderNumber = function(req, res){
	db.collection("System", function(err, collection){
		collection.find({user:"System"}).toArray(function(err, docs){
			console.log(JSON.stringify(docs));
			if(JSON.stringify(docs) == '[]'){
				database.insert("System",{user:"System", orderNumber:1});
				res.send({orderNumber:1});
			}else{
				console.log("docs[0].orderNumber+1");
				orderNumber = docs[0].orderNumber + 1;
				console.log(docs[0].orderNumber);
				database.update("System", {user:"System"}, {$set:{orderNumber:orderNumber}})
				res.send({orderNumber:orderNumber});
			}
		});
	});
}
exports.purchaserSendOrder = function(req, res){
	console.log("purchaserSendOrder")
	console.log(JSON.stringify(req.body));
	db.collection("Order", function(err, collection){
		collection.find({user:"Purchaser"}).toArray(function(err, docs){
			console.log("docs:"+JSON.stringify(docs));
			var orders = [];
			var tempOrder = req.body.plainOrder;
			tempOrder.orderNumber = req.body.orderNumber;
			orders.push(tempOrder);
			if(JSON.stringify(docs) == '[]'){
				var data = {
					user: "Purchaser",
					orders: orders,
				}
				database.insert("Order", data);
			}else{
				console.log("push");
				database.update("Order", {user:"Purchaser"}, {$push:{orders:tempOrder}});
			}
		});
	});
	db.collection("Order", function(err, collection){
		collection.find({user:"Supervisor"}).toArray(function(err, docs){
			var purchaserToSupervisorEncryptOrders = [];
			var tempOrder = req.body.toSupervisorEncryptOrder;
			tempOrder.status = "Not seen";
			tempOrder.orderNumber = req.body.orderNumber;
			purchaserToSupervisorEncryptOrders.push(tempOrder);
			if(JSON.stringify(docs) == '[]'){
				var data = {
					user:"Supervisor",
					purchaserToSupervisorEncryptOrders: purchaserToSupervisorEncryptOrders
				}
				database.insert("Order", data);
			}else{
				database.update("Order", {user:"Supervisor"}, {$push:{purchaserToSupervisorEncryptOrders:tempOrder}});
			}
		});
	});
	db.collection("Order", function(err, collection){
		collection.find({user:"OrdersDepartment"}).toArray(function(err, docs){
			var purchaserToOrdersDepartmentEncryptOrders = [];
			var tempOrder = req.body.toOrdersDepartmentEncryptOrder;
			tempOrder.status = "Not seen";
			tempOrder.orderNumber = req.body.orderNumber;
			purchaserToOrdersDepartmentEncryptOrders.push(tempOrder);
			if(JSON.stringify(docs) == '[]'){
				var data = {
					user:"OrdersDepartment",
					purchaserToOrdersDepartmentEncryptOrders: purchaserToOrdersDepartmentEncryptOrders
				}
				database.insert("Order", data);
			}else{
				database.update("Order", {user:"OrdersDepartment"}, {$push:{purchaserToOrdersDepartmentEncryptOrders:tempOrder}});
			}
		});
	});
	res.send(req.body);
}

exports.getPurchaserOrders = function(req, res){
	db.collection("Order", function(err, collection){
		collection.find({user:"Purchaser"}).toArray(function(err, docs){
			console.log(JSON.stringify(docs));
			if((JSON.stringify(docs) != '[]')|| (docs != undefined)){
				res.send(docs[0]);
			}
		});
	});
}

exports.getSupervisorOrders = function(req, res){
	db.collection("Order", function(err, collection){
		collection.find({user:"Supervisor"}).toArray(function(err, docs){
			res.send(docs[0]);
		});
	});
}

exports.getPurchasedOrders = function(req, res){
	db.collection("Order", function(err, collection){
		collection.find({user:"OrdersDepartment"}).toArray(function(err, docs){
			res.send(docs[0]);
		});
	});
}

exports.removePurchaserToSupervisorOrder = function(req, res){
	console.log(JSON.stringify(req.body));
	var orderNumber = req.body.orderNumber;
	database.update("Order",{user:"Supervisor"},{$pull:{purchaserToSupervisorEncryptOrders:{orderNumber:orderNumber}}});
	res.send({ok:"OK"});
}

exports.removeSupervisorToOrdersDepartmentOrder = function(req, res){
	console.log(JSON.stringify(req.body));
	var orderNumber = req.body.orderNumber;
	database.update("Order", {user:"OrdersDepartment"}, {$pull:{supervisorToOrdersDepartmentEncryptOrders:{orderNumber:orderNumber}}});
	database.update("Order", {user:"OrdersDepartment"}, {$pull:{purchaserToOrdersDepartmentEncryptOrders:{orderNumber:orderNumber}}});
	database.update("Order", {user:"Purchaser"}, {$pull:{orders:{orderNumber:orderNumber}}});
	res.send({ok:"OK"});
}

exports.sendPurchasedOrder = function(req, res){
	console.log("sendPurchasedOrder");
	var plainPurchasedOrder = req.body.plainOrder;
	var ordersDepartmentToPurchaserEncryptOrder = req.body.toPurchaserEncryptOrder;
	console.log(JSON.stringify(plainPurchasedOrder));
	console.log(JSON.stringify(ordersDepartmentToPurchaserEncryptOrder));
	db.collection("Order", function(err, collection){
		collection.find({user:"OrdersDepartment"}).toArray(function(err, docs){
			if(JSON.stringify(docs)!='[]'){
				if(docs[0].purchasedOrders == undefined){
					var purchasedOrders = [];
					purchasedOrders.push(plainPurchasedOrder);
					database.update("Order", {user:"OrdersDepartment"}, {$set:{purchasedOrders:purchasedOrders}});
				}else{
					var purchasedOrders = docs[0].purchasedOrders;
					var exist = false;
					purchasedOrders.forEach(function(order){
						if(order.orderNumber == plainPurchasedOrder.orderNumber){
							exist = true;
						}
					});
					if(exist == false){
						database.update("Order", {user:"OrdersDepartment"}, {$push:{purchasedOrders:plainPurchasedOrder}});
					}
				}
			}
		});
	});
	db.collection("Order", function(err, collection){
		collection.find({user:"Purchaser"}).toArray(function(err, docs){
			if(JSON.stringify(docs)!='[]'){
				if(docs[0].ordersDepartmentToPurchaserEncryptOrders == undefined){
					var ordersDepartmentToPurchaserEncryptOrders = [];
					ordersDepartmentToPurchaserEncryptOrders.push(ordersDepartmentToPurchaserEncryptOrder);
					database.update("Order", {user:"Purchaser"}, {$set:{ordersDepartmentToPurchaserEncryptOrders:ordersDepartmentToPurchaserEncryptOrders}});
				}else{
					var ordersDepartmentToPurchaserEncryptOrders = docs[0].ordersDepartmentToPurchaserEncryptOrders;
					var exist = false;
					ordersDepartmentToPurchaserEncryptOrders.forEach(function(order){
						if(order.orderNumber == plainPurchasedOrder.orderNumber){
							exist = true;
						}
					});
					if(exist == false){
						database.update("Order", {user:"Purchaser"}, {$push:{ordersDepartmentToPurchaserEncryptOrders:ordersDepartmentToPurchaserEncryptOrder}});
					}
				}
			}
		});
	});
	res.send("sendPurchasedOrder");
}
exports.sendVerifiedOrder = function(req, res){
	console.log("sendVerifiedOrder");
	console.log(JSON.stringify(req.body));
	var plainVerifiedOrder = req.body.plainOrder;
	var supervisorToOrderDepartmentEncryptOrder = req.body.toOrdersDepartmentEncryptOrder;
	db.collection("Order", function(err, collection){
		collection.find({user:"Supervisor"}).toArray(function(err, docs){
			if(JSON.stringify(docs)!='[]'){
				if(docs[0].verifiedOrders == undefined){
					var verifiedOrders = [];
					verifiedOrders.push(plainVerifiedOrder);
					database.update("Order", {user:"Supervisor"}, {$set:{verifiedOrders:verifiedOrders}});
				}else{
					var verifiedOrders = docs[0].verifiedOrders;
					var exist = false;
					verifiedOrders.forEach(function(order){
						if(order.orderNumber == plainVerifiedOrder.orderNumber){
							exist = true;
						}
					});
					if(exist == false){
						database.update("Order", {user:"Supervisor"}, {$push:{verifiedOrders:plainVerifiedOrder}});
					}
				}
			}
		});
	});
	db.collection("Order", function(err, collection){
		collection.find({user:"OrdersDepartment"}).toArray(function(err, docs){
			if(JSON.stringify(docs)!='[]'){
				if(docs[0].supervisorToOrdersDepartmentEncryptOrders == undefined){
					var supervisorToOrdersDepartmentEncryptOrders = [];
					supervisorToOrdersDepartmentEncryptOrders.push(supervisorToOrderDepartmentEncryptOrder);
					database.update("Order", {user:"OrdersDepartment"}, {$set:{supervisorToOrdersDepartmentEncryptOrders:supervisorToOrdersDepartmentEncryptOrders}});
				}else{
					var supervisorToOrdersDepartmentEncryptOrders = docs[0].supervisorToOrdersDepartmentEncryptOrders;
					var exist = false;
					supervisorToOrdersDepartmentEncryptOrders.forEach(function(order){
						if(order.orderNumber == plainVerifiedOrder.orderNumber){
							exist = true;
						}
					});
					if(exist == false){
						database.update("Order", {user:"OrdersDepartment"}, {$push:{supervisorToOrdersDepartmentEncryptOrders:supervisorToOrderDepartmentEncryptOrder}});
					}
				}
			}
		});
	});
	res.send("sendVerifiedOrder");
}

exports.getVerifiedOrder = function(req, res){
	console.log("getVerifiedOrder");
	db.collection("Order", function(err, collection){
		collection.find({user:"Supervisor"}).toArray(function(err, docs){
			if(JSON.stringify(docs)!='[]'){
				res.send(docs[0]); 
			}else{
				res.send({status:"failure"});
			}
		});
	});
}

exports.getPurchasedOrder = function(req, res){
	console.log("getPurchasedOrder");
	db.collection("Order", function(err, collection){
		collection.find({user:"Purchaser"}).toArray(function(err, docs){
			if(JSON.stringify(docs)!='[]'){
				res.send(docs[0]);
			}else{
				res.send({status:"failure"});
			}
		});
	});
}

exports.getWaitedOrder = function(req, res){
	console.log("getWaitedOrder");
	db.collection("Order", function(err, collection){
		collection.find({user:"OrdersDepartment"}).toArray(function(err, docs){
			if(JSON.stringify(docs) != '[]'){
				res.send(docs[0]);
			}else{
				res.send({status:"failure"});
			}
		});
	});
	// res.send({ok:"getWaitedOrder"});
}