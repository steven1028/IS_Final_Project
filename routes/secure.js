var cryptico = require('./RSA');
var db = require('./database').db;
var database = require('./database');
var url = require('url');


exports.checkLoginStatus = function(req, res){
    console.log("cookies");
    console.log("loginStatus cookies:"+JSON.stringify(req.cookies));
    if(req.cookies.type != undefined){
        res.send({result:true, type:req.cookies.type});
    }else{
        res.send({result:false});
    }
}

exports.userLogin = function(req, res){
    console.log("userLogin");
    console.log(req.query);
    if((req.query.account != "")&&(req.query.password != "")){
        console.log(1);
        db.collection("User", function(err, collection){
            collection.find({account:req.query.account}).toArray(function(err, docs){
                console.log(JSON.stringify(docs));
                if(JSON.stringify(docs)!="[]"){
                    console.log(2);
                    if(docs[0].account == req.query.account){
                        console.log(3);
                        if(docs[0].password == req.query.password){
                            console.log(4);
                            result = {
                                result:true,
                                type:docs[0].type
                            };
                            console.log(JSON.stringify(result));
                            res.cookie('type', docs[0].type, { maxAge: 900000, httpOnly: true });
                            res.send(result);
                        }
                    }else{
                        console.log(5);
                        result = {
                            result:false
                        };
                        res.send(result);
                    }
                }else{
                    console.log(6);
                    result = {
                        result:false
                    };
                    res.send(result);
                }
            });
        });
    }else{
        console.log(7);
        result = {
            result:false
        };
        res.send(result);
    }
}

exports.getKey = function(req, res){
	// console.log(req.url);
	var user = ""
	if(req.url == "/Purchaser/PrivateKey"){
		user = "Purchaser";
	}else if(req.url == "/OrdersDepartment/PrivateKey"){
		user = "OrdersDepartment";
	}else if(req.url == "/Supervisor/PrivateKey"){
		user = "Supervisor";
	}
	// console.log(user);
	db.collection("Key", function(err, collection){
		collection.find({user:user}).toArray(function(err, docs){
			if(docs != undefined){
                res.send(docs[0]);
            }
		});
	});
}


exports.postPrivateKey = function(req, res){
	// console.log("postPuchaserPrivateKey");
	// console.log(req.url);
	var user = ""
	if(req.url == "/Purchaser/PrivateKey"){
		user = "Purchaser";
	}else if(req.url == "/OrdersDepartment/PrivateKey"){
		user = "OrdersDepartment";
	}else if(req.url == "/Supervisor/PrivateKey"){
		user = "Supervisor";
	}
    // console.log("req.body:");
    // console.log(JSON.stringify(req.body));
	var privateKey = JSON.parse(req.body.privateKey);
	var publicKeyString = req.body.publicKeyString;
	var data = {
		user:user,
		publicKeyString:publicKeyString,
		privateKey:privateKey
	};
    // console.log("data");
    // console.log(JSON.stringify(data));
    db.collection("Key", function(err, collection){
        collection.find({user:user}).toArray(function(err, docs){
            if(JSON.stringify(docs) == '[]'){
                database.insert("Key", data);
            }else{
                database.update(
                    "Key",
                    {
                        user:user
                    },
                    {$set:{
                        publicKeyString:publicKeyString,
                        privateKey:privateKey
                    }}
                );
            }
        });
    });
    if(user == "Purchaser"){
        db.collection("Key", function(err, collection){
            collection.find({user:"Supervisor"}).toArray(function(err, docs){
                if(JSON.stringify(docs)=='[]'){
                    database.insert("Key",{user:"Supervisor", purchaserPublicKeyString:publicKeyString});
                }else{
                    database.update("Key", {user:"Supervisor"},{$set:{purchaserPublicKeyString:publicKeyString}});
                }
            });
        });
        db.collection("Key", function(err, collection){
            collection.find({user:"OrdersDepartment"}).toArray(function(err, docs){
                if(JSON.stringify(docs)=='[]'){
                    database.insert("Key",{user:"OrdersDepartment", purchaserPublicKeyString:publicKeyString});
                }else{
                    database.update("Key", {user:"OrdersDepartment"},{$set:{purchaserPublicKeyString:publicKeyString}});
                }
            });
        });
    }else if(user == "Supervisor"){
        db.collection("Key", function(err, collection){
            collection.find({user:"Purchaser"}).toArray(function(err, docs){
                if(JSON.stringify(docs)=='[]'){
                    database.insert("Key",{user:"Purchaser", supervisorPublicKeyString:publicKeyString});
                }else{
                    database.update("Key", {user:"Purchaser"},{$set:{supervisorPublicKeyString:publicKeyString}});
                }
            });
        });
        db.collection("Key", function(err, collection){
            collection.find({user:"OrdersDepartment"}).toArray(function(err, docs){
                if(JSON.stringify(docs)=='[]'){
                    database.insert("Key",{user:"OrdersDepartment", supervisorPublicKeyString:publicKeyString});
                }else{
                    database.update("Key", {user:"OrdersDepartment"},{$set:{supervisorPublicKeyString:publicKeyString}});
                }
            });
        });
    }else if(user == "OrdersDepartment"){
        db.collection("Key", function(err, collection){
            collection.find({user:"Purchaser"}).toArray(function(err, docs){
                if(JSON.stringify(docs)=='[]'){
                    database.insert("Key",{user:"Purchaser", ordersDepartmentPublicKeyString:publicKeyString});
                }else{
                    database.update("Key", {user:"Purchaser"},{$set:{ordersDepartmentPublicKeyString:publicKeyString}});
                }
            });
        });
        db.collection("Key", function(err, collection){
            collection.find({user:"Supervisor"}).toArray(function(err, docs){
                if(JSON.stringify(docs)=='[]'){
                    database.insert("Key",{user:"Supervisor", ordersDepartmentPublicKeyString:publicKeyString});
                }else{
                    database.update("Key", {user:"Supervisor"},{$set:{ordersDepartmentPublicKeyString:publicKeyString}});
                }
            });
        });
    }
	res.send(data);
}