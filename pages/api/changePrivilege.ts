// api/changePrivilege.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const dataFilePath = path.join(process.cwd(), 'data.json');

//const dataFilePath='/home/globi/deploy/data.json';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { username, privilege, accessType } = req.body;
//console.log("process.cwd() ", process.cwd());
//console.log("__dirname ", __dirname);
  try {
	 // var accessExpiration: string='nulli';
    const rawData = await readFile(dataFilePath, 'utf8');
   // console.log(rawData);
    const users = JSON.parse(rawData);

    if (accessType === 'reset') {
      // Сброс времени и снятие привилегии
      const updatedUsers = users.map((user: any) =>{
       if( user.username === username){ 
		   return { ...user, privilege: false, accessExpiration: null } 
		   }else{ 
			   return user; 
			   }
	}
      );
      await writeFile(dataFilePath, JSON.stringify(updatedUsers, null, 2));
    } else {
      // Изменение привилегий пользователя
      const updatedUsers = users.map((user: any) =>{
        if(user.username === username){ 
			//accessExpiration = calculateAccessExpiration(accessType); 
			return { ...user, privilege, accessExpiration:calculateAccessExpiration(accessType) }; 
			}else{
			return user;
		}
      });
      await writeFile(dataFilePath, JSON.stringify(updatedUsers, null, 2));
    }

    res.status(200).send({"message":"OK, сохранили!" });
  } catch (error) {
    console.error(error);
    res.status(200).send({"message": error});
  }
}

function calculateAccessExpiration(accessType: string) {
  if (accessType === 'month') {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    return expirationDate.toISOString();
  } else if (accessType === 'halfYear') {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, currentDate.getDate());
    return expirationDate.toISOString();
  } else if (accessType === 'trial20min') {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getTime() + 20 * 60 * 1000);
    return expirationDate.toISOString();
  } else {
    return null; // Обработка некорректных значений
  }
}
