const express = require("express");
const app = express();
const path = require("path");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const shortid = require("shortid");

const  XLSX = require('xlsx');

const util = require("util");
var fs = require('fs');
const readiFile = util.promisify(fs.readFile);


const http = require("http"); // Добавляем модуль http
const WebSocket = require("ws");

const os = require("os");
const process = require('process');

//const WorkerPool = require('./worker_pool.js');
/*
const pool = new WorkerPool(os.cpus().length);
process.on("beforeExit", ()=>{
	pool.close();
})
*/
const { Worker } = require('node:worker_threads');
const server = http.createServer(app); // Создаем HTTP сервер
const wss = new WebSocket.Server({ server: server, clientTracking: true });

const { EventEmitter } = require("events");
const progressEmitter = new EventEmitter(); // Создаем экземпляр EventEmitter

const DATA_DIR = path.join(__dirname, "backend/data.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.on('error',(err)=>{
	console.log("app err: ", err);
})

console.log("INITIATED");


app.post("/parser", upload.single("upload_file"), async (req, res) => {
	
  try {
    const uploadFile = req.file;
    console.log(uploadFile.filename);
    let SOME_ID = req.body.NID;
console.log("req.body.NID: ",  SOME_ID);


	 
    const start_time = Date.now();
    console.log("Начало");
    
   /*
    pool.runTask({ path:  uploadFile.filename, NID: SOME_ID }, (err, result)=>{
		if(err){
			console.log("err:", err);
			fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), (e,d)=>{console.log(e,d)});
			up_target({ nid: SOME_ID });
    res.status(500).send("An error occurred while processing the request.");
		}
	
		var resi = JSON.parse(result);
		
		if(resi.type == "progress"){
		if(resi.NID == SOME_ID){
		send_to_one(SOME_ID, resi);
	}
		return;
	}else if(resi.type == "busy"){
		console.log(resi.message);
		fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), (e,d)=>{
			console.log(e,d);
			res.status(200).send({ message: resi.message });
			});
			
			return;
	}else if(resi.type == "anfang"){
		console.log(resi);
		if(resi.NID == SOME_ID){
		down_target({ nid: SOME_ID, file: uploadFile.filename, threadId: resi.threadId });
	
	}
		return;
	}else if(resi.type == "error"){
		console.log(resi.message, resi.filename, uploadFile.filename);
		 fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), (e,d)=>{console.log(e,d)});
		 
		 up_target({ nid: SOME_ID });
		// return;
		res.status(200).send("resi.message");
	}else{
	up_target({ nid: SOME_ID });
	
	*/
	
	
	const worker = new Worker('./worker.js',{ });
	worker.ref();
	console.log("THREADID:", worker.threadId);
	
	worker.on('message', (result) => {
		let a=JSON.parse(result);
		if(a.type=="anfang"){
		console.log(result);
		worker.terminate();
	}else if(a.type=="progress"){
		if(a.NID == SOME_ID){
		send_to_one(SOME_ID, a);
	}
	}
	})
	
	 worker.on('online', ()=>{
		console.log("worker=", worker.threadId, " is online! ");
	})
	
	worker.on('error', (err) => {
		console.log(err);
	
})
const onbreak = function(d){
	console.log("***BREAK***");
	worker.terminate();
	worker.unref();
}
progressEmitter.on("break", onbreak);

worker.on('exit', (d)=>{
	console.log("worker exited ", d);
	progressEmitter.off("break", onbreak);
})

worker.postMessage({path:uploadFile.filename, threadId: worker.threadId, NID: SOME_ID })
return;
		 const end_time = Date.now();

    const time_diff = end_time - start_time;
    const days = Math.floor(time_diff / (24 * 3600 * 1000));
    const time_diff_remain = time_diff % (24 * 3600 * 1000);
    const hours = Math.floor(time_diff_remain / (3600 * 1000));
    const time_diff_remain1 = time_diff_remain % (3600 * 1000);
    const minutes = Math.floor(time_diff_remain1 / (60 * 1000));
    const seconds = Math.floor((time_diff_remain1 % (60 * 1000)) / 1000);

    const time_ = `\nУспех, время, затраченное на парсинг: \nДней: ${days} Часов: ${hours} Минут: ${minutes} Секунд: ${seconds}`;
    console.log(time_);
		 const fileName = `output_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/octet-stream"); // Set the content type
    res.status(200).download(uploadFile.path, fileName, (err) => {
      if (err) {
        console.error("some err 1:", err);
       
        fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), (e,d)=>{console.log(e,d)});
        res.status(500).send("An error occurred while downloading the file.");
      }
     // console.log(uploadFile.fileName);
      fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), (e, d)=>{console.log(e, d)});
     
    });
		
		
		
	//}	
		
//	});
   
	 
	 
  } catch (err) {
    console.error('SOME ERR:', err);
  
    fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), (e,d)=>{console.log(e,d)});
    res.status(500).send("An error occurred while processing the request.");
  }
});



wss.on("connection", (ws, req) => {
	ws.nid = shortid.generate();
	ws.down = false;
	ws.threadId = -1;
	console.log("websocket connected! ", ws.nid, wss.clients.size);
wsend(ws, {type:"NID", NID: ws.nid});

  ws.on("close", () => {
	  console.log("socket closed");
    //  if(ws.down)
     //  pool.closeThat(ws.file, ws.threadId);
     progressEmitter.emit("break", {id:1});
  });
   ws.on('error', function eri(err){
	  console.log("socket error: ", err);
  });
});
server.listen(7000, () => {
  console.log(`Server is running on port 7000`);
});

function wsend(ws, obj) {
  let a;
  try {
    a = JSON.stringify(obj);
    if (ws.readyState === WebSocket.OPEN) ws.send(a);
  } catch (e) {}
}

function send_to_one(target, obj) {
	
  for (let el of wss.clients) {
    if (el.nid == target) {
		try{
		let b=JSON.stringify(obj);
    if(el.readyState === WebSocket.OPEN)  el.send(b);
  }catch(e){console.log(e);}
      return;
    }
  }
 
 
}

function down_target(target){
	 for (let el of wss.clients) {
    if (el.nid == target.nid) {
		el.down = true;
		el.file = target.file;
		el.threadId = target.threadId;
		return;
	}}
}

function up_target(target){
	 for (let el of wss.clients) {
    if (el.nid == target.nid) {
		el.down = false;
		el.threadId = -1;
		el.file = null;
		return;
	}}
}




