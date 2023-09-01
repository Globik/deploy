var { parentPort, workerData } = require( 'node:worker_threads');
const path = require("path");
const process = require('node:process');
const { Readable } = require("stream");
const  XLSX = require('xlsx');

const util = require("util");
var fs = require('fs');
const readiFile = util.promisify(fs.readFile);

//XLSX.stream.set_readable(Readable);
const DATA_DIR = path.join(__dirname, "backend/data.json");


parentPort.on('message', async (task)=>{
	
	try{

	
	
	 const dict_all_list = [];

    // Load data from JSON file
    const jsonData1 = await readiFile(DATA_DIR, "utf-8");
const jsonData = JSON.parse(jsonData1);
    // Read Excel file
    const workbook = XLSX.readFile(
      path.join(__dirname, "uploads", task.path)
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
     
  const message = { type:"progress", progress: progress, NID:task.NID };
  let m = JSON.stringify(message);
     parentPort.postMessage(m);
 
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
          parentPort.postMessage(JSON.stringify({type: "error", message: err}));
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
          path.join(__dirname, "uploads", task.path),
        );
        break;
      } catch (err) {
        i++;
      }
    }

	
	parentPort.postMessage(JSON.stringify({ type: "done" }));
	
	
	
	
	
}catch(er){
	console.log("erri in parentPort:", er);
	parentPort.postMessage(JSON.stringify({type: "error", message: er}));
}

})
