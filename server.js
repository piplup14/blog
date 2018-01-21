console.log("Сообщение");
var http = require("http");
var fs = require("fs");
var url = require('url');
var path = require('path');
var formidable = require('formidable');
var titles = ['Tigers','Lions','Zebras','Butterfly','Hyenas','Jackals','Moles','Lemurs'];
var txts = ['тигры','львы','зебры','бабочки','гиены','шакалы','кроты','лемуры'];
var posts = ["tiger.html","","","","","","","","",""];
var comments = [[{name : "user1", email : "user1@test.ru", kom :"Текст комментария"}], 
				[{name : "user2", email : "user2@test.ru", kom :"Текст комментария", img : "/img/00004.jpg"}], [], [], [], [], [], [], []];
var imges = ['img/00001.jpg','img/00002.jpg','img/00003.jpg','img/00004.jpg','img/q/Hyena.jpg','img/q/Jackal.jpg','img/q/Mole.jpg','img/q/Lemur.jpg'];
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

http.createServer(function(request, response) {
	var requrl = url.parse(request.url, true);
	var d="";
	var id = 0;
	var p='';
	if (requrl.pathname == "/comments") {
		var form = new formidable.IncomingForm();
		form.parse(request, function(err, fields, files) {
			console.log(fields);
			console.log(files);
			response.writeHead(200, {"Content-Type": "text/html"});
			id = fields.id;
			comments[id-1][comments[id-1].length] = fields;
			if (files.av.name != '') {
			var s=files.av.name.split('.');
			s[0]=s[0]+ new Date().getTime();
			p='img/'+s[0]+'.'+s[1];
			console.log(p);
		
			comments[id-1][comments[id-1].length-1].img = p;
			}
		else
			comments[id-1][comments[id-1].length-1].img = "img/00004.jpg";
		console.log(p);
		var html = fs.readFileSync("запись.html","utf8");
		//var id = requrl.query.id;
		if (id>0 && id <= titles.length) {
			html = html.replace('Заголовок',titles[id-1]);
			html = html.replace('{{img}}',imges[id-1]);
			
			var coment = "<div class='cm'><img class='imgcm' src='{{img}}'><p>{{name}}</p><br><p>{{kom}}</p></div>"
		var coms="";
		for (var i=0;i<comments[id-1].length;i=i+1){
			var q = coment.replace('{{name}}',comments[id-1][i].name);
			var q = q.replace('{{kom}}',comments[id-1][i].kom);
			var q = q.replace('{{img}}',comments[id-1][i].img);
			coms=coms+q;
			
		}
	html=html.replace('{{repl}}',coms);
	html=html.replace('{{id}}',id);
	
		}
		else
			html = html.replace('Заголовок','Запись не найдена!');
			var p1 = Math.floor((id-1) / 4)+1;
		html = html.replace('{{param}}','?page='+p1);
		response.write(html);
		response.end();
		
    });
 
    form.on('end', function(fields, files) {
        /* Temporary location of our uploaded file */
		if( this.openedFiles[0].size > 0 ) {
        console.log("\n\nrename"+this.openedFiles[0].size + "end");
		var temp_path = this.openedFiles[0].path;
        /* The file name of the uploaded file */
        var file_name = this.openedFiles[0].name;
		
		//var id = fields.id;
		console.log(p);
		comments[id-1][comments[id-1].length-1].img = p;
        /* Location where we want to copy the uploaded file */
        //var new_location = 'img/';
 
        fs.copyFile(temp_path, p, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("success!")
				fs.unlinkSync(temp_path)
            }
        });
		}
    });
		
		/*var id = requrl.query.id;
		comments[id-1][comments[id-1].length] = requrl.query;
		//Сохранение переданного файла на сервере
		var s=requrl.query.av.split('.');
		s[0]=s[0]+ new Date().getTime();
		var p='img/'+s[0]+'.'+s[1];
		console.log(p);*/
		//var p = "img/img1.txt";
		
		
		///request.on("data", function(data) {
			//console.log("add data");
			//console.log(data);
			//console.log("\n\n\n");
			//d=d+data;
		//	fs.appendFileSync(p,data);
		//});
		//request.on("end", function() {
			//fs.writeFileSync(p,d);
			//response.writeHead(200, {"Content-Type": "text/html"});
		
		
		
		
		
	} else
/***************************************
Отдельная запись
***************************************/	
	if (requrl.pathname == "/record"){
		 response.writeHead(200, {"Content-Type": "text/html"});
		var html = fs.readFileSync("запись.html","utf8");
		var id = requrl.query.id;
		if (id>0 && id <= titles.length) {
			html = html.replace('Заголовок',titles[id-1]);
			html = html.replace('{{img}}',imges[id-1]);
			var post = ""
			if (posts[id-1] !="")
			post = fs.readFileSync("posts/"+posts[id-1],"utf8");
			html = html.replace('{{text}}',post);
			
			var coment = "<div class='cm'><img class='imgcm' src='{{img}}'><p>{{name}}</p><br><p>{{kom}}</p></div>"
		var coms="";
		for (var i=0;i<comments[id-1].length;i=i+1){
			var q = coment.replace('{{name}}',comments[id-1][i].name);
			var q = q.replace('{{kom}}',comments[id-1][i].kom);
			var q = q.replace('{{img}}',comments[id-1][i].img);
			coms=coms+q;
			
		}
	html=html.replace('{{repl}}',coms);
	html=html.replace('{{id}}',id);
		}
		else
			html = html.replace('Заголовок','Запись не найдена!');
		var p = Math.floor((id-1) / 4)+1;
		html = html.replace('{{param}}','?page='+p);
		response.write(html);
		response.end();
		
	} else
/******************************
страница блога
******************************/	
 if ((requrl.pathname == "/blog") || (requrl.pathname == "/")) {
  response.writeHead(200, {"Content-Type": "text/html"});
  var html = fs.readFileSync("блог.html","utf8");
	while(html.indexOf('22.10.2017') + 1) {
		var now = new Date();
	
		html = html.replace ('22.10.2017',now.getDate()+'.'+(now.getMonth()+1)+'.'+now.getFullYear());
	}

	while(html.indexOf('sccc=1') + 1) {
		var gh = 1;
		var html = fs.readFileSync("запись.html","utf8");
		html = html.replace ('{{param}}',gh);
	}

	while(html.indexOf('sccc=2') + 1) {
		var gh = 2;
		var html = fs.readFileSync("запись.html","utf8");
		html = html.replace ('{{param}}',gh);
	}

	for (var a=0; a<4; a=a+1){
		html = html.replace('{{title}}',titles[a]);
		html = html.replace('{{txt}}',txts[a]);
		html = html.replace('{{img}}',imges[a]);
		html = html.replace('{{id}}',a+1);
		html = html.replace('{{pio}}',comments[a].length);
	}

	for (var a=4; a<9; a=a+1){
		html = html.replace('{{titlep2}}',titles[a]);
		html = html.replace('{{txt}}',txts[a]);
		html = html.replace('{{imgp2}}',imges[a]);
		html = html.replace('{{id2}}',a+1)
		html = html.replace('{{pio}}',comments[a].length);
	}
	var page = requrl.query.page;
	if (!page)
		page=1;
	html = html.replace('{{showpage}}', "pg"+page+"();");
	
	


	response.write(html);
	response.end();
} else {
		var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './блог.html';

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }
	console.log(filePath);
    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end(); 
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

		/*response.writeHead(200, {"Content-Type": "text/html"});
		response.write("Not found");
		response.end();*/
	}
}).listen(port, ip);