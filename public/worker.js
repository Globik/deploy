//importScripts('dist_xlsx.full.min.js');
if( 'function' === typeof importScripts) {
self.addEventListener('message', async function(ev){
	importScripts('dist_xlsx.full.min.js');
	var data=ev.data;
	//console.log(data);
//	var wb=XLSX.utils.table_to_book("fuck");
try{
  var resp=await fetch("data.json");
  if(resp.ok){
	   
	  var jsonData=await resp.json();
	}  
}catch(e){
	console.error(e);
	
}
try{	
const dict_all_list = [];
const ab = new FileReaderSync().readAsArrayBuffer(data.file)
//const workbook = XLSX.readFile(data.file);
const workbook = XLSX.read(ab, { dense: true});
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
     
  const message = { type: "progress", progress: progress };
  let m = JSON.stringify(message);
     self.postMessage(message);
 
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
          //.postMessage(JSON.stringify({type: "error", message: err, filename: task.path, threadId: task.threadId }));
        }
      }
    }

    const ws = XLSX.utils.json_to_sheet(dict_all_list);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    const u8=XLSX.write(wb, { type: "array", bookType: "xlsx" });
    
    self.postMessage({type: "export", v: u8 });
    
    
    
    
    
    
    
    
    
    
    
    

}catch(e){
	console.error(e);
}


	self.postMessage({hello: "world"});
}, false)
}
