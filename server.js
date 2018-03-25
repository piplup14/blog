﻿console.log("Сообщение");
var http = require("http");
var fs = require("fs");
var url = require('url');
var path = require('path');
var formidable = require('formidable');
var db = require('./db.js');

var titles = ['Tigers','Lions','Zebras','Butterfly','Hyenas','Jackals','Moles','Lemurs'];
var txts = ['тигры','львы','зебры','бабочки','гиены','шакалы','кроты','лемуры'];
var posts = ["tiger.html","","","","","","","","",""];
var comments = [[{name : "user1", email : "user1@test.ru", kom :"Текст комментария"}], 
				[{name : "user2", email : "user2@test.ru", kom :"Текст комментария", img : "/img/00004.jpg"}], [], [], [], [], [], [], []];
var imges = ['/img/00001.jpg','/img/00002.jpg','/img/00003.jpg','/img/00004.jpg','/img/q/Hyena.jpg','/img/q/Jackal.jpg','/img/q/Mole.jpg','/img/q/Lemur.jpg'];
var sections = [];



var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

	var datab = new db.Db("mongodb://localhost:27017/blog");
	datab.getSections(function(err, results){
             sections = results;
			 var z=0;
				for (i=0;i<sections.length;i=i+1)
				{
					for (a=0;a<sections[i].posts.length;a=a+1)
					{
						comments[z]=sections[i].posts[a].comments;
						z=z+1
						
					}
					
				}
			console.log(results);
		});
	
var app = http.createServer(function(request, response) {
	var requrl = url.parse(request.url, true);
	var d="";
	var id = 0;
	var p='';
	
/**********************************
Комментарии
***************************************/	
	
	if (requrl.pathname == "/comments") {
		var form = new formidable.IncomingForm();
		form.parse(request, function(err, fields, files) {
			console.log(fields);
			console.log(files);
			response.writeHead(200, {"Content-Type": "text/html"});
			id = fields.id;
			postname = fields.postname;
			comments[id-1][comments[id-1].length] = fields;
			if (files.av.name != '') {
			var s=files.av.name.split('.');
			s[0]=s[0]+ new Date().getTime();
			p='img/'+s[0]+'.'+s[1];
			console.log(p);
			console.log(id);
		
			comments[id-1][comments[id-1].length-1].img = p;
			
			/*TODO:    Сохранять в базу данных  */
			}
		else
			comments[id-1][comments[id-1].length-1].img = "img/00004.jpg";
		console.log(p);
		datab.saveComment(postname, comments[id-1]);
		var html = fs.readFileSync("запись.html","utf8");
		for (i=0;i<sections.length;i=i+1)
				{
					for (a=0;a<sections[i].posts.length;a=a+1)
					{
						if (sections[i].posts[a].name == postname) {
							sections[i].posts[a].comments = comments[id-1];
							html = html.replace('{{img}}',sections[i].posts[a].img);
							var post = ""
							try {
							post = fs.readFileSync("posts/"+sections[i].posts[a].page,"utf8");
							}
							catch(e) {
								console.log(e);
								post = '';
							}
							html = html.replace('{{text}}',post);
							var p1 = Math.floor((id-1) / 4)+1;
							html = html.replace('{{param}}','/'+sections[i].id+'?page='+p1);			
						}
					}
					
				}
		
		
		
		//var id = requrl.query.id;
		if (id>0 && id <= titles.length) {
			html = html.replace('Заголовок',postname);
			html = html.replace('Заголовок',postname);
			//html = html.replace('{{img}}',imges[id-1]);
			
			 for (var i =0; i<4; i++){
			html = html.replace('{{sectionname}}',(sections.length>i)?sections[i].name:"");
	}
	for (var i =0; i<4; i++){
			console.log(i+"                 "+sections.length);
			html = html.replace('{{sectionid}}',(sections.length>i) && sections[i].id!=undefined?sections[i].id:i);
			html = html.replace('{{hrefid}}',(sections.length>i) && sections[i].id!=undefined?sections[i].id:i);
	}
			
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
			//var p1 = Math.floor((id-1) / 4)+1;
		//html = html.replace('{{param}}','?page='+p1);
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
сохранение сообщения
***************************************/	
	if (requrl.pathname == "/savecomment"){
		var form = formidable.IncomingForm();
		form.parse(request,function(err,fields,files){
			console.log(fields);
			fs.appendFileSync('комментарии.txt','email: '+fields.email+'\ncomments: '+fields.kom + "\n\n")	
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write('комментарий успешно сохранён');
		response.end();
		})
	} else
		
/***************************************
Раздел
***************************************/	
	if ( /\/posts\/\w+/i.test(requrl.pathname) ){
		response.writeHead(200, {"Content-Type": "text/html"});
  //console.log(requrl);
  var result = requrl.pathname.match( /\/posts\/(\w+)/i );
  console.log("Запрошеный раздел", result[1]);
  var razdel = result[1];
  var html = fs.readFileSync("блог.html","utf8");
	/*while(html.indexOf('22.10.2017') + 1) {
		var now = new Date();
	
		html = html.replace ('22.10.2017',now.getDate()+'.'+(now.getMonth()+1)+'.'+now.getFullYear());
	}*/

//TODO:  Переход на нужную страницу при возврате.
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
// Заполняем меню	
	for (var i =0; i<4; i++){
			html = html.replace('{{sectionname}}',(sections.length>i)?sections[i].name:"");
	}
	
	for (var i =0; i<4; i++){
			console.log(i+"                 "+sections.length);
			html = html.replace('{{sectionid}}',(sections.length>i) && sections[i].id!=undefined?sections[i].id:i);
			html = html.replace('{{hrefid}}',(sections.length>i) && sections[i].id!=undefined?sections[i].id:i);
	}
//  Ищем раздел	
	 var k = undefined;
	 comments=[];
	for (var i = 0; i<sections.length; i=i+1){
		if (sections[i].id!=undefined && sections[i].id == result[1]) {
			k=i;
			for (a=0;a<sections[i].posts.length;a=a+1)
			{
				comments[a]=sections[i].posts[a].comments;
			}
			break;
		}
	}
	
	if (k != undefined) {
	datab.getPosts(sections[k], function(err, res){
		console.log(res[0]);
		var postcard = fs.readFileSync("post_card.html","utf8");
		var rez = "";
	for (var i=0; i< res[0].posts.length; i=i+1) {
		
		var n = Math.floor(i/4);
		var html1 = postcard.replace('{{title}}',res[0].posts[i].name);
		html1 = html1.replace('{{txt}}',res[0].posts[i].description);
		html1 = html1.replace('{{img}}',res[0].posts[i].img);
		html1 = html1.replace('{{id}}',i+1);
		html1 = html1.replace('{{section}}',res[0].id);
		html1 = html1.replace('{{pio}}',res[0].posts[i].comments.length);
		html1 = html1.replace('{{class}}',"nv"+(n==0?"":(n+1)));
		var mydate = new Date(res[0].posts[i].data);
		html1 = html1.replace ('22.10.2017',mydate.getDate()+'.'+(mydate.getMonth()+1)+'.'+mydate.getFullYear());
		rez = rez + html1;
	}
	html = html.replace('{{allposts}}',rez);
		/*for (var a=0; a<4; a=a+1){
		if (a<res[0].posts.length) {
		html = html.replace('{{title}}',res[0].posts[a].name);
		html = html.replace('{{txt}}',res[0].posts[a].description);
		html = html.replace('{{img}}',"/"+res[0].posts[a].img);
		}
		else {
			html = html.replace('{{title}}',titles[a]);
		html = html.replace('{{txt}}',txts[a]);
		html = html.replace('{{img}}',imges[a]);
		}
		html = html.replace('{{id}}',a+1);
		html = html.replace('{{pio}}',comments[a].length);
	}

	for (var a=4; a<9; a=a+1){
		html = html.replace('{{titlep2}}',titles[a]);
		html = html.replace('{{txt}}',txts[a]);
		html = html.replace('{{imgp2}}',imges[a]);
		html = html.replace('{{id2}}',a+1)
		html = html.replace('{{pio}}',comments[a].length);
	}*/
	var page = requrl.query.page;
	if (!page)
		page=1;
	html = html.replace('{{showpage}}', "selectbyid('#" + result[1]+"'); pg"+page+"();");
	
		
				rez = '';
		n = Math.floor((res[0].posts.length - 1) / 4);
		if (n!=0) {
 for ( var i = 0 ;i<=n; i++){
	 
	 rez= rez +"<div class='nn"+(i+1)+" number' onclick='pg("+(i+1)+")'>"+(i+1)+"</div>"
	 
 }
		}
		
		
	

html = html.replace('{{pages}}',rez);


	response.write(html);
	response.end();
	})
} else {
	fs.readFile('./404.html', function(error, content) {
                    //response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
}	

	
	} else 
/***************************************
Отдельная запись
***************************************/	
	if (requrl.pathname == "/record"){
		 response.writeHead(200, {"Content-Type": "text/html"});
		var html = fs.readFileSync("запись.html","utf8");
		var id = requrl.query.id;
		var section = requrl.query.section;
		
		var k = undefined;
		console.log(sections);
	for (var i = 0; i<sections.length; i=i+1){
		if (sections[i].id!=undefined && sections[i].id == section) {
			k=i;
			break;
		}
	}
	
	if (k != undefined) {
	datab.getPosts(sections[k], function(err, res){
		console.log(res[0]);
		
		
		/*for (var i=0; i< res[0].posts.length; i=i+1) {
		
		var n = Math.floor(i/4);
		var html1 = postcard.replace('{{title}}',res[0].posts[i].name);
		html1 = html1.replace('{{txt}}',res[0].posts[i].description);
		html1 = html1.replace('{{img}}',res[0].posts[i].img);
		html1 = html1.replace('{{id}}',i+1);
		html1 = html1.replace('{{pio}}',res[0].posts[i].comments.length);
		html1 = html1.replace('{{class}}',"nv"+(n==0?"":(n+1)));
		rez = rez + html1;
	}*/
		
		if (id>0 && id <= res[0].posts.length) {
			html = html.replace('Заголовок',res[0].posts[id-1].name);
			html = html.replace('Заголовок',res[0].posts[id-1].name);
			html = html.replace('{{img}}',res[0].posts[id-1].img);
			var post = ""
			if (posts[id-1] !="")
			try {
			post = fs.readFileSync("posts/"+res[0].posts[id-1].page,"utf8");
			}
			catch(e) {
				console.log(e);
				post = '';
			}
			html = html.replace('{{text}}',post);
			 
			 for (var i =0; i<4; i++){
			html = html.replace('{{sectionname}}',(sections.length>i)?sections[i].name:"");
	}
	for (var i =0; i<4; i++){
			console.log(i+"                 "+sections.length);
			html = html.replace('{{sectionid}}',(sections.length>i) && sections[i].id!=undefined?sections[i].id:i);
			html = html.replace('{{hrefid}}',(sections.length>i) && sections[i].id!=undefined?sections[i].id:i);
	}
			 
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
	html=html.replace('{{razdel}}',res[0].posts[id-1].name);
		}
		var p = Math.floor((id-1) / 4)+1;
		html = html.replace('{{param}}','/'+section+'?page='+p);
		response.write(html);
		response.end();
	})}
		else {
			html = html.replace('Заголовок','Запись не найдена!');
		var p = Math.floor((id-1) / 4)+1;
		html = html.replace('{{param}}','?page='+p);
		response.write(html);
		response.end();
		}
	} else
/******************************
страница блога
******************************/	
 if ((requrl.pathname == "/blog") || (requrl.pathname == "/")) {
  response.writeHead(200, {"Content-Type": "text/html"});
  datab.getSections(function(err, results){
      
  var html = fs.readFileSync("блог.html","utf8");
  var postcard = fs.readFileSync("post_card.html","utf8");
	/*while(html.indexOf('22.10.2017') + 1) {
		var now = new Date();
	
		html = html.replace ('22.10.2017',);
	}*/

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
	
	for (var i =0; i<4; i++){
			html = html.replace('{{sectionname}}',(sections.length>i)?sections[i].name:"");
	}

	for (var i =0; i<4; i++){
			console.log(i+"                 "+sections.length);
			html = html.replace('{{sectionid}}',(sections.length>i) && sections[i].id!=undefined?sections[i].id:i);
			html = html.replace('{{hrefid}}',(sections.length>i) && sections[i].id!=undefined?sections[i].id:i);
	}
	
	var rez = "";
	
 //вывод всех записей
var cnt = 0;
comments = [];
z = 0;
 for (var ap=0;ap< sections.length;ap++)
 {
	console.log('section count = '+sections.length + "\n\n");
	for (var i=0; i< sections[ap].posts.length; i=i+1) {
		
		console.log('post count = '+sections[ap].posts.length + "\n\n");
		
		var n = Math.floor(cnt/4);
		cnt= cnt + 1;
		var html1 = postcard.replace('{{title}}',sections[ap].posts[i].name);
		html1 = html1.replace('{{txt}}',sections[ap].posts[i].description);
		html1 = html1.replace('{{img}}',sections[ap].posts[i].img);
		html1 = html1.replace('{{id}}',i+1);
		html1 = html1.replace('{{section}}',sections[ap].id);
		html1 = html1.replace('{{pio}}',sections[ap].posts[i].comments.length);
		comments[z] = sections[ap].posts[i].comments;
		z = z + 1;
		html1 = html1.replace('{{class}}',"nv"+(n==0?"":(n+1)));
		var mydate = new Date(sections[ap].posts[i].data);
		html1 = html1.replace ('22.10.2017',mydate.getDate()+'.'+(mydate.getMonth()+1)+'.'+mydate.getFullYear());
		rez = rez + html1;
	}
 }
	html = html.replace('{{allposts}}',rez);
	
	/*for (var a=0; a<4; a=a+1){
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
	}*/
	var page = requrl.query.page;
	if (!page)
		page=1;
	html = html.replace('{{showpage}}', "pg"+page+"();");
	rez = '';
	
	/*посчитать сумму постов во всех разделах*/
	var cq=0;
	for (var ap=0;ap< sections.length;ap++){
		cq=cq+sections[ap].posts.length
	}
	
	
	n = Math.floor((cq-1) / 4);
 for ( var i = 0 ;i<=n; i++){
	 
	 rez= rez +"<div class='nn"+(i+1)+" number' onclick='pg("+(i+1)+")'>"+(i+1)+"</div>"
	 
 }
html = html.replace('{{pages}}',rez);

	response.write(html);
	response.end();
sections = results;
console.log(results);
		});
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
		case '.ico':
			contentType = 'image/x-icon';
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
});
app.listen(port, ip);

module.exports = app;