const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
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
const wss = new WebSocket.Server({ noServer: true, clientTracking: false });

const { EventEmitter } = require("events");
const progressEmitter = new EventEmitter(); // Создаем экземпляр EventEmitter

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
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

console.log("INITIATED");

app.post("/parser", upload.single("upload_file"), async (req, res) => {
  try {
    const uploadFile = req.file;
    console.log(uploadFile.filename);

    const start_time = Date.now();
    console.log("Начало");
   
    pool.runTask({ path:  uploadFile.filename }, (err, result)=>{
		if(err){
			console.log("err:", err);
    res.status(500).send("An error occurred while processing the request.");
		}
		console.log("result:", result);
		var resi = JSON.parse(result);
		//console.log("PROGI4 ***", resi.progress, Number.isInteger(resi.progress));
		if(resi.type == "progress"){
		//	console.log("***PROGRESS***:", resi.progress);
			let m=JSON.stringify({progress:resi.progress});
		progressEmitter.emit("progress", m); 
		return;
	}else if(resi.type == "error"){
		 fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), ()=>{});
		res.status(500).send(resi.message);
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
        fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), ()=>{});
        res.status(500).send("An error occurred while downloading the file.");
      }
      fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), ()=>{});
    });
		
		
		
	}	
		
	});
     
  } catch (err) {
    console.error('SOME ERR:', err);
     fs.unlink(path.join(__dirname, "uploads", uploadFile.filename), ()=>{});
    res.status(500).send("An error occurred while processing the request.");
  }
});

wss.on("connection", (ws) => {
  const progressHandler = (progress) => {
	//  console.log("ON PROGRESS", progress);
    ws.send(progress.toString());
  };

  progressEmitter.on("progress", progressHandler);

  ws.on("close", () => {
    progressEmitter.off("progress", progressHandler);
  });
});
server.listen(7000, () => {
  console.log(`Server is running on port 7000`);
});
