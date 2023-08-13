// api/changePrivilege.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { username, privilege, accessType } = req.body;

  try {
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const users = JSON.parse(rawData);

    if (accessType === 'reset') {
      // Сброс времени и снятие привилегии
      const updatedUsers = users.map((user: any) =>
        user.username === username ? { ...user, privilege: false, accessExpiration: null } : user
      );
      fs.writeFileSync(dataFilePath, JSON.stringify(updatedUsers, null, 2));
    } else {
      // Изменение привилегий пользователя
      const updatedUsers = users.map((user: any) =>
        user.username === username ? { ...user, privilege, accessExpiration: calculateAccessExpiration(accessType) } : user
      );
      fs.writeFileSync(dataFilePath, JSON.stringify(updatedUsers, null, 2));
    }

    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
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
