const {createServer}=require('https');
const fs=require('fs');
const next=require('next');
console.log("NODE_ENV ", process.env.NODE_ENV);
const dev=process.env.NODE_ENV !== 'production';
const port=3001;
const app=next({dev});
const handle=app.getRequestHandler();
const {parse}=require('url');

const httpsopt={
	key: fs.readFileSync('/home/globi/aliktv/data/chel_key.pem'),
	cert: fs.readFileSync('/home/globi/aliktv/data/chel_cert.pem'),
	 ca: fs.readFileSync('/home/globi/aliktv/data/chel_ca.cert')
	
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
