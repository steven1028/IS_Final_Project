var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('127.0.0.1', 27017, { auto_reconnect: true, poolSize: 10 });
exports.db = new mongodb.Db('IS_Project', mongodbServer);



exports.insert = function(type, result){
	// console.log("insert");
	// console.log(JSON.stringify(type));
	// console.log(JSON.stringify(result));
	this.db.collection(type , function(err, collection) {
		collection.insert(
			result,
			function(err, data){
				if(data){
					console.log('Succeessfully Insert');
				}else{
					console.log('Failed to Insert');
				}
			}
		);
    });  
}


exports.update = function(type, query, option){
	// console.log("update");
	// console.log(JSON.stringify(type));
	// console.log(JSON.stringify(option));
	this.db.collection(type, function(err, collection){
		collection.update(
			query,
			option
		);
	});
}
