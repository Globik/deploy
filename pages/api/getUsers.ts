import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
const readFile = promisify(fs.readFile);
const dataFilePath = path.join(process.cwd(), 'data.json');


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	  if (req.method === 'GET') {
    
  try{
	  const users = await readFile(dataFilePath, 'utf8');
	  let a=JSON.parse(users);
	  res.status(200).send({"users": a });
  }catch(e){
	  console.log(e);
	  res.status(200).send({"message": e});
  }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
