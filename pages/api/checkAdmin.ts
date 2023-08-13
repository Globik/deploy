import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const cookies = cookie.parse(req.headers.cookie || '');
  const username = cookies.username;

  // Здесь ваша проверка админских привилегий на основе имени пользователя (username)
  if (username === 'admin') {
    res.status(200).json({ isAdmin: true });
  } else {
    res.status(200).json({ isAdmin: false });
  }
}
