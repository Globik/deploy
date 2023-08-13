const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const XLSX = require("xlsx");
const http = require("http"); // Добавляем модуль http
const WebSocket = require("ws");

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
    const dict_all_list = [];

    // Load data from JSON file
    const jsonData = JSON.parse(fs.readFileSync(DATA_DIR, "utf-8"));

    // Read Excel file
    const workbook = XLSX.readFile(
      path.join(__dirname, "uploads", uploadFile.filename)
    );
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const cellRange = XLSX.utils.decode_range(worksheet["!ref"]);
    const firstColumnIndex = cellRange.s.c;
    const lastColumnIndex = cellRange.e.c;

    // Access the first column
    for (let i = cellRange.s.r + 1; i <= cellRange.e.r; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: firstColumnIndex });
      const cellValue = worksheet[cellAddress]?.v?.toString();
      const progress = Math.round(
        ((i - cellRange.s.r) / (cellRange.e.r - cellRange.s.r)) * 100
      );
      const message = JSON.stringify({ progress }); // Создаем JSON-сообщение
      progressEmitter.emit("progress", message); // Отправляем сообщение через EventEmitter
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
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    const ws = XLSX.utils.json_to_sheet(dict_all_list);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    let i = 0;
    while (true) {
      try {
        XLSX.writeFile(
          wb,
          path.join(__dirname, "uploads", uploadFile.filename)
        );
        break;
      } catch (err) {
        i++;
      }
    }

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
        console.error(err);
        res.status(500).send("An error occurred while downloading the file.");
      }
      fs.unlinkSync(path.join(__dirname, "uploads", uploadFile.filename));
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while processing the request.");
  }
});

wss.on("connection", (ws) => {
  const progressHandler = (progress) => {
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
