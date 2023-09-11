const {createServer}=require('https');
const fs=require('fs');
const next=require('next');
console.log("NODE_ENV ", process.env.NODE_ENV);
var dev=process.env.NODE_ENV !== 'production';
const dkey = "/etc/letsencrypt/live/сортировка-номеров.рф/privkey.pem";
const dcert = "/etc/letsencrypt/live/сортировка-номеров.рф/fullchain.pem";
dev=false;
console.log(process.env.NODE_ENV);
const port=3003;
const app=next({dev});
const handle=app.getRequestHandler();
const {parse}=require('url');
/*
const httpsopt={
	key: fs.readFileSync('/home/globi/aliktv/data/chel_key.pem'),
	cert: fs.readFileSync('/home/globi/aliktv/data/chel_cert.pem'),
	 ca: fs.readFileSync('/home/globi/aliktv/data/chel_ca.cert')
	
};
*/
 const httpsopt = {
    key: fs.readFileSync(dkey),
    cert: fs.readFileSync(dcert),
  };
  
app.prepare().then(()=>{
	createServer(httpsopt,(req,res)=>{
		const p=parse(req.url, true);
		handle(req, res, p);
	}).listen(port, (err)=>{
		if(err) throw err;
		console.log("https localhost ", port);
	});
})
