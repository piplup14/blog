var mongoClient = require("mongodb").MongoClient;

Db.prototype.dbcon = null;

function Db(path) {
	//console.log("module connected/ Sent " + path);
	Db.path = path;
}
Db.prototype.getSections = function( f ) {
	mongoClient.connect(Db.path, function(err, db){
 
		if(err){
			return console.log(err);
		}
		console.log("connected");
		//Db.dbcon = db;
		//console.log(res);
		//res = true;
		//console.log("dat");
		db.collection("sections").find().toArray(f);
		// взаимодействие с базой данных
	});

	
}

Db.prototype.getPosts = function(sectionname, f){
	mongoClient.connect(Db.path, function(err, db){
 
		if(err){
			return console.log(err);
		}
		console.log("connected");
		//Db.dbcon = db;
		//console.log(res);
		//res = true;
		//console.log("dat");
		
		//db.collection("sections").find({name: sectionname}).toArray(f);
		db.collection("sections").find().toArray(f);
		// взаимодействие с базой данных
	});
}

exports.Db = Db;