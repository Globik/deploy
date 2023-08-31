const express = require("express");
const app = express();
const path = require("path");
const { Readable } = require("stream");
//const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });


const  XLSX = require('xlsx');

const util = require("util");
var fs = require('fs');
const readiFile = util.promisify(fs.readFile);

//XLSX.stream.set_readable(Readable);
//const XLSX = require("xlsx");
const http = require("http"); // Добавляем модуль http
const WebSocket = require("ws");

const os = require("os");
const process = require('process');

const WorkerPool = require('./worker_pool.js');

const pool = new WorkerPool(os.cpus().length);
process.on("beforeExit", ()=>{
	pool.close();
})

const server = http.createServer(app); // Создаем HTTP сервер
const wss = new WebSocket.Server({ server: server, clientTracking: true });

const { EventEmitter } = require("events");
const progressEmitter = new EventEmitter(); // Создаем экземпляр EventEmitter

//server.on("upgrade", (request, socket, head) => {
 /* wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
  */ 
//});
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
var suu=1;
console.log("INITIATED", suu.toString());


app.post("/parser", upload.single("upload_file"), async (req, res) => {
  try {
    const uploadFile = req.file;
    console.log(uploadFile.filename);
    let SOME_ID = req.body.NID;
console.log("req.body.NID: ",  SOME_ID);
    const start_time = Date.now();
    console.log("Начало");
    
   
    pool.runTask({ path:  uploadFile.filename, NID: SOME_ID }, (err, result)=>{
		if(err){
			console.log("err:", err);
			fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), (e,d)=>{console.log(e,d)});
    res.status(500).send("An error occurred while processing the request.");
		}
		//console.log("result:", result);
		var resi = JSON.parse(result);
		//console.log("PROGI4 ***", resi.progress, Number.isInteger(resi.progress));
		if(resi.type == "progress"){
		//	console.log("***PROGRESS***:", resi.progress);
			let m=JSON.stringify({progress:resi.progress});
		//progressEmitter.emit("progress", m); 
		return;
	}else if(resi.type == "error"){
		console.log(resi.message);
		 fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), (e,d)=>{console.log(e,d)});
		 return;
		//res.status(500).send(resi.message);
	}else{
	
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
      fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), ()=>{});
    });
		
		
		
	}	
		
	});
     pool.on("fuck", function(d){
		 let t=JSON.parse(d);
		 
		// console.log("on msg", t.progress, " ", t.NID, " ", SOME_ID);
		// progressEmitter.emit(SOME_ID, d); 
		if(t.NID == SOME_ID){
		send_to_one(SOME_ID, d);
	}
	 });
	 
	 /*
	 const dict_all_list = [];

    // Load data from JSON file
    const jsonData1 = await readiFile(DATA_DIR, "utf-8");
const jsonData = JSON.parse(jsonData1);
    // Read Excel file
    //const workbook = await readiFile(path.join(__dirname, "uploads", uploadFile.filename), "utf-8");
    const workbook = XLSX.readFile( path.join(__dirname, "uploads", uploadFile.filename) );
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const cellRange = XLSX.utils.decode_range(worksheet["!ref"]);
    const firstColumnIndex = cellRange.s.c;
    const lastColumnIndex = cellRange.e.c;

    // Access the first column
    function abba(){
		return new Promise((rej, res)=>{
    for (let i = cellRange.s.r + 1; i <= cellRange.e.r; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: firstColumnIndex });
      const cellValue = worksheet[cellAddress]?.v?.toString();
      const progress = Math.round(
        ((i - cellRange.s.r) / (cellRange.e.r - cellRange.s.r)) * 100
      );
      const message = JSON.stringify({ type:"progress", progress: progress }); // Создаем JSON-сообщение
  progressEmitter.emit("progress", message); 
     //parentPort.postMessage(message);
 
      const number_in_sver = cellValue ? cellValue.slice(1) : "";
      for (const j of jsonData) {
        try {
          const jsonCode = parseInt(j["Код"]);
          const finish_format_numb = parseInt(
            number_in_sver.slice(0, String(j["Код"]).length)
          );
          if (jsonCode === finish_format_numb) {
            const operator = j["Оператор"];
            const oblast = j["Область"];
            const number = cellValue;
            const dict_ = {
              [oblast]: number,
            };
            dict_all_list.push(dict_);
            res("ok");
          }
        } catch (err) {
          console.error(err);
          rej("fucker error");
         // parentPort.postMessage(JSON.stringify({type: "error", message: err}));
        }
      }
    }
})
}

let suka = await abba();
    const ws = XLSX.utils.json_to_sheet(dict_all_list);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    let i = 0;
    while (true) {
      try {
        XLSX.writeFileAsync(
          
          path.join(__dirname, "uploads", uploadFile.filename),
          wb,
          (d)=>{
			console.log("file write ended: ", d);  
		//	break;
		  }
        );
        break;
      } catch (err) {
        i++;
      }
    }

	
	  res.status(200).send("ok");
	 
	 */
  } catch (err) {
    console.error('SOME ERR:', err);
     fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), (e,d)=>{console.log(e,d)});
    res.status(500).send("An error occurred while processing the request.");
  }
});


var fu=0;
wss.on("connection", (ws, req) => {
	ws.nid=fu;
	console.log("websocket connected! ", ws.nid, wss.clients.size);
let sd=ws.nid.toString();
	ws.nid=sd;
ws.send(JSON.stringify({type:"NID", NID: ws.nid}));

    var progressHandler=(progress) => {
	//console.log("ON PROGRESS", progress);
	let a=JSON.parse(progress);
	a.NID=ws.nid;
	
	let b=JSON.stringify(a);
    ws.send(b);
  };
  
fu++;

/*
  progressEmitter.on(ws.nid.toString(), (progress) => {
	//console.log("ON PROGRESS", progress);
	let a=JSON.parse(progress);
	a.NID=sd;
	let b=JSON.stringify(a);
    ws.send(b);
  });
 */
  ws.on("close", () => {
	  console.log("socket closed");
	//  fu--;
	  pool.closeThat();
  //  progressEmitter.off(ws.nid.toString(), );
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
  //  console.log("type:", obj.type);
    if (ws.readyState === WebSocket.OPEN) ws.send(a);
  } catch (e) {}
}

function send_to_one(target, obj) {
  for (let el of wss.clients) {
    if (el.nid == target) {
		//console.log("obj:", obj);
		let a=JSON.parse(obj);
		a.NID=el.nid;
		let b=JSON.stringify(a);
      el.send(b);
      return;
    }
  }
}






