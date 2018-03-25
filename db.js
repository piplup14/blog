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
		db.collection("sections").find({id: sectionname.id}).toArray(f);
		// взаимодействие с базой данных
	});
}

Db.prototype.saveComment = function (post, comments) {
	mongoClient.connect(Db.path, function(err, db){
 
		if(err){
			return console.log(err);
		}
		db.collection("sections").find({"posts.name" : post}).toArray(function (err, res){
			var section = res
			
				console.log("BD: "+section[0].name);
		
		for (i=0; i<section[0].posts.length; i=i+1)
			if (section[0].posts[i].name == post)
				section[0].posts[i].comments = comments;
			
			console.log(section[0].posts)
			
		var section = db.collection("sections").update({"posts.name" : post}, { $set: { posts: section[0].posts }});
		});
		
		
		// взаимодействие с базой данных
	});
}

exports.Db = Db;